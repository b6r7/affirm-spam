/** Plugin main thread entry. Built to figma-plugin/code.js. __html__ is injected at build time by scripts/build-plugin-code.mjs. */
/// <reference path="./globals.d.ts" />
import type {
  AppState,
  MessageFromUI,
  Locale,
  Tone,
  Variant,
  TemplateType,
  TemplateInfo,
  DraftPayload,
  EmailContent,
  CustomTemplateContent,
  CustomTemplateLocaleContent,
  InsertToCanvasPayload,
  LibrarySnapshotV1,
} from '../../figma-plugin/messageTypes';
import { RECOMMENDED_VARIANT } from '../../figma-plugin/messageTypes';

/** Effective locale for current selection (system: state.locale; custom: selectedTemplateLocale or baseLocale). */
function getEffectiveLocale(state: AppState): Locale {
  const templateId = state.selectedTemplateId;
  if (!isCustomTemplateId(templateId)) return state.locale;
  const custom = state.customTemplatesContent[templateId];
  if (!custom) return state.locale;
  const requested = state.templates?.selectedTemplateLocale ?? custom.baseLocale;
  return custom.locales[requested] ? requested : custom.baseLocale;
}

/** Computes variant payload only (no canvas work). Reused by GENERATE_VARIANTS and INSERT_TO_CANVAS. */
function buildVariantsOnly(state: AppState): InsertToCanvasPayload | null {
  const templateId = state.selectedTemplateId;
  const templateInfo = getTemplateById(state, templateId);
  if (!templateId || !templateInfo) return null;
  const tone = state.tone;
  const isCustom = isCustomTemplateId(templateId);
  let locale: Locale;
  let variants: Record<Variant, EmailContent>;

  if (isCustom) {
    const customContent = state.customTemplatesContent[templateId];
    if (!customContent) return null;
    const requestedLocale = state.templates?.selectedTemplateLocale ?? customContent.baseLocale;
    let localeEntry = customContent.locales[requestedLocale];
    if (!localeEntry) {
      locale = customContent.baseLocale;
      localeEntry = customContent.locales[customContent.baseLocale];
    } else {
      locale = requestedLocale;
    }
    if (!localeEntry) return null;
    variants = localeEntry.variants;
  } else {
    locale = state.locale;
    variants = {
      A: getSystemEmailContent({ templateId, locale, tone, variant: 'A' }),
      B: getSystemEmailContent({ templateId, locale, tone, variant: 'B' }),
      C: getSystemEmailContent({ templateId, locale, tone, variant: 'C' }),
    };
  }
  // Use current locale first so the bold title is translated (e.g. "Recordatorio de pago", "Przypomnienie o płatności")
  const templateName =
    (templateInfo.name?.[locale] != null) ? templateInfo.name[locale]
    : (templateInfo.name?.['en-US'] != null) ? templateInfo.name['en-US']
    : (templateId != null ? String(templateId) : 'Template');
  return { templateName, locale, tone, layoutMode: state.layoutMode, previewDevice: state.previewDevice, variants };
}
import { loadState, saveState, getDefaultState, computeUi, isCustomTemplateId } from '../../figma-plugin/storage';
import { computeLibraryHash } from '../../figma-plugin/libraryHash';

/** Set to true only in development to allow RESET_STORAGE message (clear plugin data). Not exposed in UI by default. */
const DEV_RESET_STORAGE_ENABLED = false;
import { getEmailLayoutSpec, EMAIL_LAYOUT_FONT_FAMILY, PREVIEW_DEVICE_WIDTHS } from '../../figma-plugin/emailLayout';
import { getSystemEmailContent } from '../../figma-plugin/translations';
import { buildEmailLayoutSpec } from './emailLayout/spec';
import { renderSpecToFigma } from './emailLayout/renderFigma';
import {
  CTA_FILL,
  HEADER_FILL,
  HERO_FILL,
  LEGAL_FILL,
  PARENT_FILL,
  PARENT_STROKE,
  SPACING_FRAME_GAP,
  SPACING_PLACEMENT_OFFSET,
  STROKE_WEIGHT,
} from './emailLayout/tokens';
import {
  resolveGenomeSpacingTokens,
  applySpacingBinding,
  getAllVariableNamesForDump,
  type GenomeSpacingTokenKey,
} from './genomeTokens';

const VARIANT_ORDER: Variant[] = ['A', 'B', 'C'];

const SYNC_NAMESPACE = 'affirm_spam';
const SYNC_KEY_LIBRARY = 'library_v1';
const SYNC_KEY_META = 'library_v1_meta';

function buildLibrarySnapshot(state: AppState): LibrarySnapshotV1 {
  const updatedAt = new Date().toISOString();
  const updatedBy =
    typeof figma.currentUser !== 'undefined' && figma.currentUser != null
      ? (figma.currentUser.name ?? (figma.currentUser as { id?: string }).id ?? undefined)
      : undefined;
  return {
    version: 1,
    updatedAt,
    updatedBy,
    templates: state.templateCatalog,
    customTemplatesContent: state.customTemplatesContent,
  };
}

type StoredResult = { kind: 'ok'; snapshot: LibrarySnapshotV1 } | { kind: 'none' } | { kind: 'invalid' };

function getStoredSnapshot(): StoredResult {
  const raw = figma.root.getSharedPluginData(SYNC_NAMESPACE, SYNC_KEY_LIBRARY);
  if (raw == null || raw === '') return { kind: 'none' };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed != null &&
      typeof parsed === 'object' &&
      (parsed as LibrarySnapshotV1).version === 1 &&
      typeof (parsed as LibrarySnapshotV1).updatedAt === 'string' &&
      Array.isArray((parsed as LibrarySnapshotV1).templates) &&
      typeof (parsed as LibrarySnapshotV1).customTemplatesContent === 'object' &&
      (parsed as LibrarySnapshotV1).customTemplatesContent !== null &&
      !Array.isArray((parsed as LibrarySnapshotV1).customTemplatesContent)
    ) {
      return { kind: 'ok', snapshot: parsed as LibrarySnapshotV1 };
    }
  } catch {
    // invalid JSON
  }
  return { kind: 'invalid' };
}

function writeSnapshot(snapshot: LibrarySnapshotV1): void {
  const libraryHash = computeLibraryHash(snapshot.templates, snapshot.customTemplatesContent);
  figma.root.setSharedPluginData(SYNC_NAMESPACE, SYNC_KEY_LIBRARY, JSON.stringify(snapshot));
  if (SYNC_KEY_META) {
    const meta = {
      lastSyncedAt: snapshot.updatedAt,
      lastSyncedBy: snapshot.updatedBy,
      libraryHash,
    };
    figma.root.setSharedPluginData(SYNC_NAMESPACE, SYNC_KEY_META, JSON.stringify(meta));
  }
}

function applyPulledSnapshot(state: AppState, snapshot: LibrarySnapshotV1): void {
  state.templateCatalog = snapshot.templates;
  state.customTemplatesContent = snapshot.customTemplatesContent;
  state.syncMeta = { lastSyncedAt: snapshot.updatedAt, lastSyncedBy: snapshot.updatedBy };
  const stillExists = state.templateCatalog.some((t) => t.id === state.selectedTemplateId);
  if (!stillExists && state.templateCatalog.length > 0) {
    state.selectedTemplateId = state.templateCatalog[0].id;
  } else if (state.templateCatalog.length === 0) {
    state.selectedTemplateId = '';
  }
  state.generated = undefined;
  state.exportState = 'idle';
}

const AUTO_SYNC_DEBOUNCE_MS = 800;
let autoSyncDebounceTimeoutId: ReturnType<typeof setTimeout> | null = null;

/**
 * If auto-sync is enabled, schedules a single write to shared plugin data after a debounce.
 * Never blocks UI; on write failure toasts "Auto-sync failed".
 */
function maybeAutoSyncLibrary(_reason: string): void {
  if (!state.settings?.autoSyncToFile) return;
  if (autoSyncDebounceTimeoutId != null) {
    clearTimeout(autoSyncDebounceTimeoutId);
    autoSyncDebounceTimeoutId = null;
  }
  autoSyncDebounceTimeoutId = setTimeout(() => {
    autoSyncDebounceTimeoutId = null;
    try {
      const snapshot = buildLibrarySnapshot(state);
      writeSnapshot(snapshot);
      const lastFileHash = computeLibraryHash(snapshot.templates, snapshot.customTemplatesContent);
      state.syncMeta = {
        lastSyncedAt: snapshot.updatedAt,
        lastSyncedBy: snapshot.updatedBy,
        lastFileHash,
      };
      sendState();
      saveState(state).catch(() => { /* already toasting on write failure */ });
    } catch {
      sendToast('Auto-sync failed.');
    }
  }, AUTO_SYNC_DEBOUNCE_MS);
}

/** __html__ is injected once by build-plugin-code.mjs; no inline UI_HTML to avoid double evaluation. */
figma.showUI(__html__, { width: 900, height: 720 });

let state: AppState = getDefaultState();

function sendState() {
  state.ui = computeUi(state.selectedTemplateId, state.prototypeState);
  state.templates = state.templates != null ? state.templates : {};
  state.libraryStatus = {
    localHash: computeLibraryHash(state.templateCatalog, state.customTemplatesContent),
    fileHash: state.syncMeta?.lastFileHash,
    lastSyncedAt: state.syncMeta?.lastSyncedAt,
    lastSyncedBy: state.syncMeta?.lastSyncedBy,
  };
  figma.ui.postMessage({ type: 'STATE', state });
}

function sendError(message: string) {
  figma.ui.postMessage({ type: 'ERROR', message });
}

function sendToast(message: string) {
  figma.ui.postMessage({ type: 'TOAST', message });
}

function getTemplateById(state: AppState, id: TemplateType): TemplateInfo | undefined {
  return state.templateCatalog.find((t) => t.id === id);
}

function buildInsertPayload(state: AppState): InsertToCanvasPayload | null {
  return buildVariantsOnly(state);
}

/**
 * Insert variant cards to canvas. Only inserts variants in selectedVariants; if empty, inserts all.
 * Uses shared layout spec (Affirm vs SPI). Every node that gets layoutSizing* must already be
 * a child of an auto-layout frame; we append first, then set layoutSizing.
 */
async function insertVariantsToCanvas(
  payload: InsertToCanvasPayload,
  selectedVariants: Variant[]
): Promise<void> {
  const page = figma.currentPage;
  if (!page) {
    throw new Error('No page available.');
  }
  const { templateName, locale, tone, layoutMode, previewDevice, variants } = payload;
  const toInsert: Variant[] =
    selectedVariants.length > 0 ? selectedVariants : VARIANT_ORDER;
  const layoutLabel = layoutMode === 'spi' ? 'SPI' : 'Affirm';
  const frameName = `Affirm SPAM — ${templateName} — ${locale} — ${tone} — ${layoutLabel}`;
  const legacySpec = getEmailLayoutSpec(layoutMode);
  const cardWidth = PREVIEW_DEVICE_WIDTHS[previewDevice];
  await resolveGenomeSpacingTokens();
  const applySpacing = (node: FrameNode, field: 'itemSpacing' | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'paddingBottom', tokenKey: GenomeSpacingTokenKey, pxFallback: number) => {
    applySpacingBinding(node, field, tokenKey, pxFallback);
  };
  const font = { family: EMAIL_LAYOUT_FONT_FAMILY, style: 'Regular' };
  const fontSemibold = { family: EMAIL_LAYOUT_FONT_FAMILY, style: 'Semi Bold' };
  let hasSemibold = false;
  try {
    await figma.loadFontAsync(font);
    await figma.loadFontAsync(fontSemibold);
    hasSemibold = true;
    } catch {
      try {
        await figma.loadFontAsync(font);
      } catch {
        throw new Error('Could not load font.');
      }
    }
  const headingFont = hasSemibold && legacySpec.headingFontWeight === 'semibold' ? fontSemibold : font;
  const ctaFont = hasSemibold && legacySpec.ctaFontWeight === 'semibold' ? fontSemibold : font;

  const parent = figma.createFrame();
  parent.name = frameName;
  parent.layoutMode = 'HORIZONTAL';
  parent.primaryAxisSizingMode = 'AUTO';
  parent.counterAxisSizingMode = 'AUTO';
  applySpacing(parent, 'itemSpacing', 'stackGapPrimary', SPACING_FRAME_GAP);
  applySpacing(parent, 'paddingLeft', 'sectionPaddingX', legacySpec.padding);
  applySpacing(parent, 'paddingRight', 'sectionPaddingX', legacySpec.padding);
  applySpacing(parent, 'paddingTop', 'sectionPaddingY', legacySpec.padding);
  applySpacing(parent, 'paddingBottom', 'sectionPaddingY', legacySpec.padding);
  parent.fills = [{ type: 'SOLID', color: PARENT_FILL }];
  parent.strokes = [{ type: 'SOLID', color: PARENT_STROKE }];
  parent.strokeWeight = STROKE_WEIGHT;
  parent.cornerRadius = legacySpec.cornerRadius;

  for (const variant of toInsert) {
    const content = variants[variant];
    const spec = buildEmailLayoutSpec({
      templateName,
      content,
      layoutMode,
      device: previewDevice,
    });
    const card = figma.createFrame();
    card.name = `Variant ${variant}`;
    card.layoutMode = 'VERTICAL';
    card.primaryAxisSizingMode = 'AUTO';
    card.counterAxisSizingMode = 'FIXED';
    card.counterAxisAlignItems = 'MIN';
    applySpacing(card, 'itemSpacing', 'stackGapSecondary', spec.sectionGap);
    const isAffirmLayout = layoutMode === 'affirm';
    applySpacing(card, 'paddingLeft', 'sectionPaddingX', spec.padding);
    applySpacing(card, 'paddingRight', 'sectionPaddingX', spec.padding);
    if (isAffirmLayout) {
      card.paddingTop = legacySpec.headerHeightAffirm + 16;
    } else {
      applySpacing(card, 'paddingTop', 'sectionPaddingY', spec.padding);
    }
    applySpacing(card, 'paddingBottom', 'sectionPaddingY', spec.padding);
    card.fills = [{ type: 'SOLID', color: spec.fill }];
    card.strokes = [{ type: 'SOLID', color: spec.stroke }];
    card.strokeWeight = STROKE_WEIGHT;
    card.cornerRadius = spec.cornerRadius;

    renderSpecToFigma(spec, {
      card,
      cardWidth,
      font,
      headingFont,
      ctaFont,
      legalFill: LEGAL_FILL,
      ctaFill: CTA_FILL,
      headerFill: HEADER_FILL,
      heroFill: HERO_FILL,
      strokeColor: spec.stroke,
      applySpacing,
    });

    const contentHeight = Math.max(card.height || 0, 500);
    card.resize(cardWidth, contentHeight);
    parent.appendChild(card);
  }

  if (parent.children.length !== toInsert.length) {
    const msg = `Insert guard: expected ${toInsert.length} cards, got ${parent.children.length}.`;
    parent.remove();
    throw new Error(msg);
  }
  page.appendChild(parent);
  const selection = figma.currentPage.selection;
  if (selection.length > 0 && selection[0] && 'x' in selection[0] && 'width' in selection[0]) {
    const node = selection[0];
    parent.x = node.x + (node.width != null ? node.width : 0) + SPACING_PLACEMENT_OFFSET;
    parent.y = node.y != null ? node.y : 0;
  } else {
    const center = figma.viewport.center;
    parent.x = center.x - parent.width / 2;
    parent.y = center.y - parent.height / 2;
  }
  figma.currentPage.selection = [parent];
  figma.viewport.scrollAndZoomIntoView([parent]);
  sendToast(`Inserted: ${toInsert.join(', ')} · ${previewDevice} · ${layoutLabel}`);
}

figma.ui.onmessage = async (msg: unknown) => {
  if (typeof msg !== 'object' || msg === null || !('type' in msg)) return;
  const m = msg as MessageFromUI;

  try {
    switch (m.type) {
      case 'INIT': {
        state = await loadState();
        const stored = getStoredSnapshot();
        if (stored.kind === 'ok') {
          const lastFileHash = computeLibraryHash(
            stored.snapshot.templates,
            stored.snapshot.customTemplatesContent
          );
          state.syncMeta = {
            lastSyncedAt: stored.snapshot.updatedAt,
            lastSyncedBy: stored.snapshot.updatedBy,
            lastFileHash,
          };
        } else if (stored.kind === 'none') {
          state.syncMeta = undefined;
        }
        sendState();
        break;
      }
      case 'SET_LOCALE':
        if (isCustomTemplateId(state.selectedTemplateId)) {
          sendToast('Locale is locked for custom templates.');
          break;
        }
        state.locale = m.locale;
        if (state.prototypeState === 'draft-unsaved') state.draftLocale = m.locale;
        state.exportState = 'idle';
        state.generated = undefined;
        await saveState(state);
        sendState();
        break;
      case 'SET_TONE':
        state.tone = m.tone;
        state.exportState = 'idle';
        state.generated = undefined;
        await saveState(state);
        sendState();
        break;
      case 'SET_LAYOUT_MODE':
        state.layoutMode = m.layoutMode;
        state.generated = undefined;
        await saveState(state);
        sendState();
        break;
      case 'SET_PREVIEW_DEVICE':
        state.previewDevice = m.previewDevice;
        await saveState(state);
        sendState();
        break;
      case 'TOGGLE_VARIANT': {
        const idx = state.selectedVariants.indexOf(m.variant);
        if (idx >= 0) state.selectedVariants = state.selectedVariants.filter((v) => v !== m.variant);
        else state.selectedVariants = [...state.selectedVariants, m.variant];
        await saveState(state);
        sendState();
        break;
      }
      case 'SELECT_TEMPLATE':
        state.selectedTemplateId = m.templateId;
        if (!String(m.templateId).startsWith('custom-')) {
          state.templates = { ...state.templates };
          delete state.templates.selectedTemplateLocale;
        }
        state.exportState = 'idle';
        state.isDeprecated = false;
        state.generated = undefined;
        await saveState(state);
        sendState();
        break;
      case 'START_ADD_TEMPLATE':
        state.prototypeState = 'draft-unsaved';
        state.draftName = '';
        state.draftLocale = 'es-MX';
        state.draftText = '';
        state.isDraftDirty = false;
        await saveState(state);
        sendState();
        break;
      case 'UPDATE_DRAFT':
        state.draftName = m.payload.name;
        state.draftLocale = m.payload.locale;
        state.draftText = m.payload.text;
        state.isDraftDirty = true;
        await saveState(state);
        sendState();
        break;
      case 'SAVE_DRAFT': {
        const payload = m.payload;
        const id: TemplateType = `custom-${Date.now()}`;
        const displayName = payload.name || `Payment reminder – ${payload.locale}`;
        const nameForLocales: Record<Locale, string> = {
          'en-US': displayName, 'en-GB': displayName, 'es-ES': displayName, 'es-MX': displayName, 'pl-PL': displayName, 'fr-FR': displayName,
        };
        const descriptionForLocales: Record<Locale, string> = {
          'en-US': 'Custom template created from draft', 'en-GB': 'Custom template created from draft',
          'es-ES': 'Plantilla personalizada creada desde borrador', 'es-MX': 'Plantilla personalizada creada desde borrador',
          'pl-PL': 'Szablon niestandardowy utworzony z wersji roboczej', 'fr-FR': 'Modèle personnalisé créé à partir du brouillon',
        };
        const newTemplate: TemplateInfo = { id, name: nameForLocales, description: descriptionForLocales, intent: 'Repayments' };
        state.templateCatalog = [newTemplate, ...state.templateCatalog];
        state.selectedTemplateId = id;
        state.isBaseTemplate = false;
        state.locale = payload.locale;
        state.prototypeState = 'normal';
        const draftBody = payload.text.trim() || 'No content.';
        const baseContent: EmailContent = {
          greeting: 'Hello {name},', body: draftBody, footer: '', cta: 'Make a payment',
          legalText: 'Loans made or arranged pursuant to applicable law. Affirm Loan Services, LLC.',
        };
        const baseLocale = payload.locale;
        state.customTemplatesContent = {
          ...state.customTemplatesContent,
          [id]: {
            baseLocale,
            locales: {
              [baseLocale]: { tone: 'Neutral', variants: { A: { ...baseContent }, B: { ...baseContent }, C: { ...baseContent } }, status: 'custom' },
            },
          },
        };
        await saveState(state);
        sendState();
        break;
      }
      case 'CANCEL_DRAFT':
        state.prototypeState = 'normal';
        await saveState(state);
        sendState();
        break;
      case 'RESOLVE_COMPLIANCE_ISSUE': {
        const arr = state.resolvedComplianceIssues[m.locale] != null ? state.resolvedComplianceIssues[m.locale] : [];
        if (!arr.includes(m.issueIndex)) {
          state.resolvedComplianceIssues = { ...state.resolvedComplianceIssues, [m.locale]: [...arr, m.issueIndex] };
          await saveState(state);
        }
        sendState();
        break;
      }
      case 'SHOW_TOAST':
        if (typeof m.message === 'string') sendToast(m.message);
        break;
      case 'EXPORT_SELECTED':
        if (state.isDeprecated || state.selectedVariants.length === 0) break;
        state.exportState = 'exported-selected';
        state.lastExportedAt = Date.now();
        sendState();
        sendToast('Exported JSON');
        break;
      case 'EXPORT_ALL':
        if (state.isDeprecated) break;
        state.exportState = 'exported-all';
        state.lastExportedAt = Date.now();
        sendState();
        sendToast('Exported JSON');
        break;
      case 'GENERATE_VARIANTS':
        state.isGenerating = true;
        state.exportState = 'idle';
        sendState();
        const genPayload = buildVariantsOnly(state);
        if (!genPayload) {
          sendError('No template content found.');
          state.isGenerating = false;
          sendState();
          break;
        }
        const signature = `${state.selectedTemplateId}|${genPayload.locale}|${genPayload.tone}`;
        state.generated = {
          templateId: state.selectedTemplateId,
          templateName: genPayload.templateName,
          locale: genPayload.locale,
          tone: genPayload.tone,
          variants: genPayload.variants,
          generatedAt: Date.now(),
          signature,
        };
        if (state.selectedVariants.length === 0) {
          state.selectedVariants = [RECOMMENDED_VARIANT];
        }
        state.isGenerating = false;
        await saveState(state);
        sendState();
        sendToast('Variants generated.');
        maybeAutoSyncLibrary('GENERATE_VARIANTS');
        break;
      case 'INSERT_TO_CANVAS': {
        state.exportState = 'idle';
        const effectiveLocale = getEffectiveLocale(state);
        const currentSignature = `${state.selectedTemplateId}|${effectiveLocale}|${state.tone}`;
        let payload: InsertToCanvasPayload | null = null;
        const g = state.generated;
        if (g && g.signature === currentSignature) {
          payload = { templateName: g.templateName, locale: g.locale, tone: g.tone, layoutMode: state.layoutMode, previewDevice: state.previewDevice, variants: g.variants };
        }
        if (!payload) payload = buildVariantsOnly(state);
        if (!payload) {
          sendError('No template content found.');
          break;
        }
        state.isGenerating = true;
        sendState();
        try {
          await insertVariantsToCanvas(payload, state.selectedVariants);
          if (!g || g.signature !== currentSignature) {
            state.generated = {
              templateId: state.selectedTemplateId,
              templateName: payload.templateName,
              locale: payload.locale,
              tone: payload.tone,
              variants: payload.variants,
              generatedAt: Date.now(),
              signature: `${state.selectedTemplateId}|${payload.locale}|${payload.tone}`,
            };
            await saveState(state);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          sendToast('Insert failed. Check the console for details.');
          console.error('Insert to canvas failed:', message, err, {
            templateName: payload.templateName,
            locale: payload.locale,
            tone: payload.tone,
            layoutMode: payload.layoutMode,
            previewDevice: payload.previewDevice,
            selectedVariants: state.selectedVariants,
          });
        } finally {
          state.isGenerating = false;
          sendState();
        }
        break;
      }
      case 'TOGGLE_BASE_TEMPLATE':
        state.isBaseTemplate = !state.isBaseTemplate;
        await saveState(state);
        sendState();
        break;
      case 'DUPLICATE_TEMPLATE': {
        const sourceId = state.selectedTemplateId;
        const sourceTemplate = getTemplateById(state, sourceId);
        if (!sourceTemplate) break;
        const newId: TemplateType = `custom-${Date.now()}`;
        const displayName = sourceTemplate.name['en-US'] ?? sourceTemplate.name[state.locale] ?? String(sourceId);
        const nameForLocales = { ...sourceTemplate.name };
        for (const k of Object.keys(nameForLocales) as Locale[]) {
          nameForLocales[k] = `${displayName} (copy)`;
        }
        const newTemplate: TemplateInfo = {
          id: newId,
          name: nameForLocales,
          description: { ...sourceTemplate.description },
          intent: sourceTemplate.intent,
        };
        state.templateCatalog = [newTemplate, ...state.templateCatalog];
        state.selectedTemplateId = newId;
        state.isBaseTemplate = false;
        state.exportState = 'idle';
        state.generated = undefined;
        if (isCustomTemplateId(sourceId)) {
          const sourceContent = state.customTemplatesContent[sourceId];
          if (sourceContent) {
            const localesCopy: Record<string, CustomTemplateLocaleContent> = {};
            for (const [loc, entry] of Object.entries(sourceContent.locales)) {
              localesCopy[loc] = {
                tone: entry.tone,
                variants: {
                  A: { ...entry.variants.A },
                  B: { ...entry.variants.B },
                  C: { ...entry.variants.C },
                },
                status: entry.status,
              };
            }
            state.customTemplatesContent = {
              ...state.customTemplatesContent,
              [newId]: { baseLocale: sourceContent.baseLocale, locales: localesCopy },
            };
          }
        } else {
          const baseContent = getSystemEmailContent({ templateId: sourceId, locale: state.locale, tone: state.tone, variant: 'B' });
          const baseLocale = state.locale;
          state.customTemplatesContent = {
            ...state.customTemplatesContent,
            [newId]: {
              baseLocale,
              locales: {
                [baseLocale]: {
                  tone: state.tone,
                  variants: { A: { ...baseContent }, B: { ...baseContent }, C: { ...baseContent } },
                  status: 'auto',
                },
              },
            },
          };
        }
        await saveState(state);
        sendState();
        sendToast('Template duplicated.');
        maybeAutoSyncLibrary('DUPLICATE_TEMPLATE');
        break;
      }
      case 'RENAME_TEMPLATE': {
        const name = typeof m.name === 'string' ? m.name.trim() : '';
        if (!name) break;
        const tid = state.selectedTemplateId;
        const t = state.templateCatalog.find((x) => x.id === tid);
        if (!t) break;
        for (const loc of Object.keys(t.name) as Locale[]) {
          t.name[loc] = name;
        }
        state.templateCatalog = [...state.templateCatalog];
        await saveState(state);
        sendState();
        sendToast('Template renamed.');
        maybeAutoSyncLibrary('RENAME_TEMPLATE');
        break;
      }
      case 'DELETE_TEMPLATE': {
        const tid = state.selectedTemplateId;
        if (!tid) break;
        const idx = state.templateCatalog.findIndex((x) => x.id === tid);
        if (idx < 0) break;
        state.templateCatalog = state.templateCatalog.filter((x) => x.id !== tid);
        if (isCustomTemplateId(tid)) {
          const { [tid]: _, ...rest } = state.customTemplatesContent;
          state.customTemplatesContent = rest;
        }
        state.generated = undefined;
        if (state.templateCatalog.length === 0) {
          state.selectedTemplateId = '';
        } else {
          const nextIndex = Math.min(idx, state.templateCatalog.length - 1);
          state.selectedTemplateId = state.templateCatalog[nextIndex].id;
        }
        state.isBaseTemplate = state.templateCatalog.some((x) => x.id === state.selectedTemplateId);
        state.isDeprecated = false;
        await saveState(state);
        sendState();
        sendToast('Template deleted.');
        maybeAutoSyncLibrary('DELETE_TEMPLATE');
        break;
      }
      case 'MARK_DEPRECATED':
        state.isDeprecated = true;
        state.exportState = 'idle';
        await saveState(state);
        sendState();
        sendToast('Marked as deprecated.');
        maybeAutoSyncLibrary('MARK_DEPRECATED');
        break;
      case 'RESET_STORAGE':
        if (!DEV_RESET_STORAGE_ENABLED) break;
        state = getDefaultState();
        await saveState(state);
        sendState();
        sendToast('Storage reset.');
        break;
      case 'CREATE_TRANSLATION': {
        const { templateId, targetLocale } = m;
        if (!templateId || !String(templateId).startsWith('custom-')) break;
        const content = state.customTemplatesContent[templateId];
        if (!content) break;
        const source = content.locales[content.baseLocale];
        if (!source) break;
        const locales = { ...content.locales };
        locales[targetLocale] = { tone: source.tone, variants: { A: { ...source.variants.A }, B: { ...source.variants.B }, C: { ...source.variants.C } }, status: 'auto' };
        state.customTemplatesContent = { ...state.customTemplatesContent, [templateId]: { ...content, locales } };
        await saveState(state);
        sendState();
        sendToast(`Translation added for ${targetLocale}.`);
        maybeAutoSyncLibrary('CREATE_TRANSLATION');
        break;
      }
      case 'SELECT_TEMPLATE_LOCALE': {
        const { templateId, locale } = m;
        if (!templateId || !String(templateId).startsWith('custom-') || templateId !== state.selectedTemplateId) break;
        state.templates = { ...state.templates, selectedTemplateLocale: locale };
        state.generated = undefined;
        await saveState(state);
        sendState();
        break;
      }
      case 'IMPORT_TRANSLATIONS': {
        const { templateId: incomingTemplateId, json: jsonStr } = m;
        let data: {
          sourceLocale?: string;
          fields?: { greeting?: string; body?: string; footer?: string; cta?: string; legalText?: string };
          meta?: { story?: string };
          locales?: Record<string, Record<string, string>>;
        };
        try {
          data = JSON.parse(jsonStr) as typeof data;
        } catch {
          sendToast('Invalid JSON.');
          break;
        }

        const LEGAL_DEFAULT =
          'Loans made or arranged pursuant to applicable law. Affirm Loan Services, LLC.';

        const shortToLocale: Record<string, Locale> = {
          en: 'en-US',
          'en-US': 'en-US',
          'en-GB': 'en-GB',
          es: 'es-ES',
          'es-ES': 'es-ES',
          'es-MX': 'es-MX',
          fr: 'fr-FR',
          'fr-FR': 'fr-FR',
          pl: 'pl-PL',
          'pl-PL': 'pl-PL',
        };

        function flatKeysToEmailContent(flat: Record<string, string>): EmailContent {
          const title = flat['email.title'] ?? flat['title'] ?? '';
          const heading = flat['email.heading'] ?? flat['heading'] ?? '';
          const bodyPrimary = flat['email.body.primary'] ?? flat['body.primary'] ?? '';
          const bodySecondary = flat['email.body.secondary'] ?? flat['body.secondary'] ?? '';
          const body = [bodyPrimary, bodySecondary].filter(Boolean).join('\n\n');
          const cta = flat['email.cta'] ?? flat['cta'] ?? '';
          const footnote = flat['email.footnote'] ?? flat['footer'] ?? '';
          return {
            ...(title && { title }),
            greeting: heading,
            body,
            footer: footnote,
            cta,
            legalText: flat['legalText'] ?? LEGAL_DEFAULT,
          };
        }

        if (data.locales && typeof data.locales === 'object') {
          const localesData = data.locales as Record<string, Record<string, string>>;
          const displayName =
            (data.meta?.story as string) ?? 'Imported template';
          const nameForLocales: Record<Locale, string> = {
            'en-US': displayName,
            'en-GB': displayName,
            'es-ES': displayName,
            'es-MX': displayName,
            'pl-PL': displayName,
            'fr-FR': displayName,
          };
          const descriptionForLocales: Record<Locale, string> = {
            'en-US': 'Custom template from import',
            'en-GB': 'Custom template from import',
            'es-ES': 'Plantilla personalizada desde importación',
            'es-MX': 'Plantilla personalizada desde importación',
            'pl-PL': 'Szablon niestandardowy z importu',
            'fr-FR': 'Modèle personnalisé depuis import',
          };

          const id: TemplateType = `custom-${Date.now()}`;
          const newTemplate: TemplateInfo = {
            id,
            name: nameForLocales,
            description: descriptionForLocales,
            intent: 'Repayments',
          };

          const locales: Record<Locale, CustomTemplateLocaleContent> = {};
          let firstLocale: Locale | null = null;

          for (const [short, flat] of Object.entries(localesData)) {
            const loc = shortToLocale[short];
            if (!loc) continue;
            const baseContent = flatKeysToEmailContent(flat);
            const variants = {
              A: { ...baseContent },
              B: { ...baseContent },
              C: { ...baseContent },
            };
            locales[loc] = { tone: 'Neutral', variants, status: 'custom' as const };
            if (!firstLocale) firstLocale = loc;
          }

          if (firstLocale == null || Object.keys(locales).length === 0) {
            sendToast('No supported locales found. Supported: en, es, fr, pl.');
            break;
          }

          const isCustomSelected =
            incomingTemplateId &&
            String(incomingTemplateId).startsWith('custom-');
          const existingContent = isCustomSelected
            ? state.customTemplatesContent[incomingTemplateId]
            : null;

          if (isCustomSelected && existingContent) {
            const merged: Record<Locale, CustomTemplateLocaleContent> = {
              ...existingContent.locales,
            };
            for (const [loc, entry] of Object.entries(locales)) {
              merged[loc as Locale] = entry;
            }
            state.customTemplatesContent = {
              ...state.customTemplatesContent,
              [incomingTemplateId]: {
                ...existingContent,
                locales: merged,
              },
            };
            sendToast('Translations imported.');
          } else {
            state.templateCatalog = [newTemplate, ...state.templateCatalog];
            state.selectedTemplateId = id;
            state.isBaseTemplate = false;
            state.locale = firstLocale;
            state.templates = { ...state.templates, selectedTemplateLocale: firstLocale };
            state.customTemplatesContent = {
              ...state.customTemplatesContent,
              [id]: { baseLocale: firstLocale, locales },
            };
            sendToast(`Imported "${displayName}" as new template.`);
          }

          maybeAutoSyncLibrary('IMPORT_TRANSLATIONS');
        } else {
          const fields = data.fields;
          if (!fields) {
            sendToast('Import format not recognized. Use meta+locales or fields.');
            break;
          }
          if (!incomingTemplateId || !String(incomingTemplateId).startsWith('custom-')) {
            sendToast('Select a custom template first, or import a file with meta+locales.');
            break;
          }
          const content = state.customTemplatesContent[incomingTemplateId];
          if (!content) {
            sendToast('Template not found.');
            break;
          }
          const localeKey = (data.sourceLocale &&
            content.locales[data.sourceLocale as Locale]
            ? data.sourceLocale
            : content.baseLocale) as Locale;
          const baseContent: EmailContent = {
            greeting: fields.greeting ?? '',
            body: fields.body ?? '',
            footer: fields.footer ?? '',
            cta: fields.cta ?? '',
            legalText: fields.legalText ?? '',
          };
          const entry =
            content.locales[localeKey] ?? content.locales[content.baseLocale];
          const tone = entry?.tone ?? 'Neutral';
          const variants = {
            A: { ...baseContent },
            B: { ...baseContent },
            C: { ...baseContent },
          };
          const newLocales = {
            ...content.locales,
            [localeKey]: { tone, variants, status: 'custom' as const },
          };
          state.customTemplatesContent = {
            ...state.customTemplatesContent,
            [incomingTemplateId]: { ...content, locales: newLocales },
          };
          sendToast('Translations imported.');
          maybeAutoSyncLibrary('IMPORT_TRANSLATIONS');
        }

        await saveState(state);
        sendState();
        break;
      }
      case 'SET_AUTO_SYNC':
        state.settings = { ...state.settings, autoSyncToFile: m.enabled };
        await saveState(state);
        sendState();
        break;
      case 'SYNC_TO_FILE': {
        const snapshot = buildLibrarySnapshot(state);
        const stored = getStoredSnapshot();
        const ourLastSynced = state.syncMeta?.lastSyncedAt ?? '';
        if (stored.kind === 'ok' && stored.snapshot.updatedAt > ourLastSynced) {
          figma.ui.postMessage({
            type: 'SYNC_CONFLICT',
            remoteUpdatedAt: stored.snapshot.updatedAt,
            remoteUpdatedBy: stored.snapshot.updatedBy,
          });
          break;
        }
        writeSnapshot(snapshot);
        const syncFileHash = computeLibraryHash(snapshot.templates, snapshot.customTemplatesContent);
        state.syncMeta = {
          lastSyncedAt: snapshot.updatedAt,
          lastSyncedBy: snapshot.updatedBy,
          lastFileHash: syncFileHash,
        };
        console.log('[Sync] wrote snapshot');
        sendToast('Synced to file.');
        await saveState(state);
        sendState();
        break;
      }
      case 'SYNC_OVERWRITE_CONFIRMED': {
        const snapshot = buildLibrarySnapshot(state);
        writeSnapshot(snapshot);
        const overwriteFileHash = computeLibraryHash(snapshot.templates, snapshot.customTemplatesContent);
        state.syncMeta = {
          lastSyncedAt: snapshot.updatedAt,
          lastSyncedBy: snapshot.updatedBy,
          lastFileHash: overwriteFileHash,
        };
        console.log('[Sync] wrote snapshot (overwrite)');
        sendToast('Synced to file.');
        await saveState(state);
        sendState();
        break;
      }
      case 'PULL_FROM_FILE': {
        const stored = getStoredSnapshot();
        if (stored.kind === 'none') {
          sendToast('No library in file. Sync to file first.');
          break;
        }
        if (stored.kind === 'invalid') {
          sendError('Invalid library data in file.');
          sendToast('Invalid library data in file.');
          break;
        }
        applyPulledSnapshot(state, stored.snapshot);
        console.log('[Sync] pulled snapshot');
        sendToast('Pulled from file.');
        await saveState(state);
        sendState();
        break;
      }
      case 'DOWNLOAD_LIBRARY_JSON': {
        const format = m.format ?? 'single';
        const locales = Array.isArray(m.locales) ? m.locales : [];
        if (format === 'per_locale' && locales.length > 0) {
          const files: Array<{ locale: Locale; json: string }> = [];
          for (const loc of locales) {
            const customFiltered: Record<string, CustomTemplateContent> = {};
            for (const [tid, content] of Object.entries(state.customTemplatesContent)) {
              const entry = content.locales[loc as Locale];
              if (entry) {
                customFiltered[tid] = {
                  baseLocale: content.baseLocale,
                  locales: { [loc]: entry },
                };
              }
            }
            const templatesFiltered = state.templateCatalog.map((t) => {
              const nameVal = t.name?.[loc as Locale];
              const descVal = t.description?.[loc as Locale];
              return {
                id: t.id,
                name: nameVal != null ? { [loc]: nameVal } : ({} as Record<Locale, string>),
                description: descVal != null ? { [loc]: descVal } : ({} as Record<Locale, string>),
                intent: t.intent,
              };
            });
            const snapshot: LibrarySnapshotV1 = {
              version: 1,
              updatedAt: new Date().toISOString(),
              updatedBy:
                typeof figma.currentUser !== 'undefined' && figma.currentUser != null
                  ? (figma.currentUser.name ?? (figma.currentUser as { id?: string }).id ?? undefined)
                  : undefined,
              templates: templatesFiltered,
              customTemplatesContent: customFiltered,
            };
            files.push({ locale: loc as Locale, json: JSON.stringify(snapshot, null, 2) });
          }
          figma.ui.postMessage({ type: 'LIBRARY_JSON_FOR_DOWNLOAD_MULTI', files });
        } else {
          const snapshot = buildLibrarySnapshot(state);
          figma.ui.postMessage({
            type: 'LIBRARY_JSON_FOR_DOWNLOAD',
            json: JSON.stringify(snapshot, null, 2),
          });
        }
        break;
      }
      case 'COPY_VARIABLE_NAMES_DEBUG': {
        const list = await getAllVariableNamesForDump();
        const lines = list.map((r) => `${r.collection}\t${r.name}\t${r.id}`);
        figma.ui.postMessage({ type: 'VARIABLE_NAMES_DUMP', lines });
        break;
      }
      default:
        break;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    sendError(message);
    sendToast(message);
  }
};

setTimeout(() => sendState(), 30);
