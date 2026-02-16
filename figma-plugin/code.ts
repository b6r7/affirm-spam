/**
 * Affirm SPAM Figma plugin — main thread (source of truth).
 * Holds AppState in memory; persists catalog/custom content; responds to UI messages with STATE.
 */

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
  InsertToCanvasPayload,
} from './messageTypes';
import { loadState, saveState, getDefaultState, computeUi, isCustomTemplateId } from './storage';
import { getSystemEmailContent } from './translations';

const VARIANT_ORDER: Variant[] = ['A', 'B', 'C'];
const CARD_WIDTH = 420;
const CARD_MIN_HEIGHT = 520;
const CARD_PADDING = 24;
const CARD_SPACING = 16;
const FRAME_SPACING = 24;
const PLACEMENT_GAP = 80;
const FONT_SIZE_BODY = 16;
const FONT_SIZE_LEGAL = 12;
const FONT_SIZE_CTA = 14;
const CTA_HEIGHT = 40;
const CTA_CORNER = 8;
const VARIANT_CORNER = 12;

figma.showUI(__html__, { width: 360, height: 720 });

figma.showUI(UI_HTML, { width: 360, height: 720 });

let state: AppState = getDefaultState();

function sendState() {
  state.ui = computeUi(state.selectedTemplateId, state.prototypeState);
  state.templates = state.templates ?? {};
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

/**
 * Build insertion payload from current state.
 * SYSTEM: use state.locale and getSystemEmailContent.
 * CUSTOM: use state.templates.selectedTemplateLocale ?? baseLocale; fallback to baseLocale with toast if locale missing.
 */
function buildInsertPayload(state: AppState): InsertToCanvasPayload | null {
  const templateId = state.selectedTemplateId;
  const templateInfo = getTemplateById(state, templateId);
  const tone = state.tone;

  const isCustom = isCustomTemplateId(templateId);
  let insertionLocale: Locale;
  let variants: Record<Variant, EmailContent>;

  if (isCustom) {
    const customContent = state.customTemplatesContent[templateId];
    if (!customContent) {
      return null;
    }
    const requestedLocale = state.templates?.selectedTemplateLocale ?? customContent.baseLocale;
    let localeEntry = customContent.locales[requestedLocale];
    if (!localeEntry) {
      sendToast('Missing locale version, inserted base locale.');
      insertionLocale = customContent.baseLocale;
      localeEntry = customContent.locales[customContent.baseLocale];
    } else {
      insertionLocale = requestedLocale;
    }
    if (!localeEntry) {
      return null;
    }
    variants = localeEntry.variants;
  } else {
    insertionLocale = state.locale;
    variants = {
      A: getSystemEmailContent({
        templateId,
        locale: insertionLocale,
        tone,
        variant: 'A',
      }),
      B: getSystemEmailContent({
        templateId,
        locale: insertionLocale,
        tone,
        variant: 'B',
      }),
      C: getSystemEmailContent({
        templateId,
        locale: insertionLocale,
        tone,
        variant: 'C',
      }),
    };
  }

  const templateName =
    templateInfo?.name[insertionLocale] ?? templateInfo?.name['en-US'] ?? String(templateId) ?? 'Template';

  return {
    templateName,
    locale: insertionLocale,
    tone,
    variants,
  };
}

async function insertVariantsToCanvas(payload: InsertToCanvasPayload): Promise<void> {
  const page = figma.currentPage;
  if (!page) {
    sendToast('No page available.');
    return;
  }

  const { templateName, locale, tone, variants } = payload;
  const frameName = `Affirm SPAM — ${templateName} — ${locale} — ${tone}`;

  const font = { family: 'Inter', style: 'Regular' };
  try {
    await figma.loadFontAsync(font);
  } catch {
    sendToast('Could not load font.');
    return;
  }

  const parent = figma.createFrame();
  parent.name = frameName;
  parent.layoutMode = 'HORIZONTAL';
  parent.primaryAxisSizingMode = 'AUTO';
  parent.counterAxisSizingMode = 'AUTO';
  parent.itemSpacing = FRAME_SPACING;
  parent.paddingLeft = CARD_PADDING;
  parent.paddingRight = CARD_PADDING;
  parent.paddingTop = CARD_PADDING;
  parent.paddingBottom = CARD_PADDING;
  parent.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  parent.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
  parent.strokeWeight = 1;
  parent.cornerRadius = VARIANT_CORNER;

  for (const variant of VARIANT_ORDER) {
    const content = variants[variant];
    const card = figma.createFrame();
    card.name = `Variant ${variant}`;
    card.layoutMode = 'VERTICAL';
    card.primaryAxisSizingMode = 'AUTO';
    card.counterAxisSizingMode = 'FIXED';
    card.itemSpacing = CARD_SPACING;
    card.paddingLeft = CARD_PADDING;
    card.paddingRight = CARD_PADDING;
    card.paddingTop = CARD_PADDING;
    card.paddingBottom = CARD_PADDING;
    card.resize(CARD_WIDTH, CARD_MIN_HEIGHT);
    card.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
    card.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.85 } }];
    card.strokeWeight = 1;
    card.cornerRadius = VARIANT_CORNER;

    const greetingText = figma.createText();
    greetingText.fontName = font;
    greetingText.fontSize = FONT_SIZE_BODY;
    greetingText.characters = content.greeting || '—';
    greetingText.textAlignHorizontal = 'LEFT';
    card.appendChild(greetingText);

    const bodyText = figma.createText();
    bodyText.fontName = font;
    bodyText.fontSize = FONT_SIZE_BODY;
    bodyText.characters = content.body || '—';
    bodyText.textAlignHorizontal = 'LEFT';
    bodyText.layoutSizingHorizontal = 'FILL';
    bodyText.layoutSizingVertical = 'HUG';
    card.appendChild(bodyText);

    if (content.footer && content.footer.trim()) {
      const footerText = figma.createText();
      footerText.fontName = font;
      footerText.fontSize = FONT_SIZE_BODY;
      footerText.characters = content.footer;
      footerText.textAlignHorizontal = 'LEFT';
      footerText.layoutSizingHorizontal = 'FILL';
      card.appendChild(footerText);
    }

    const ctaFrame = figma.createFrame();
    ctaFrame.name = 'CTA';
    ctaFrame.resize(CARD_WIDTH - CARD_PADDING * 2, CTA_HEIGHT);
    ctaFrame.layoutMode = 'HORIZONTAL';
    ctaFrame.primaryAxisAlignItems = 'CENTER';
    ctaFrame.counterAxisAlignItems = 'CENTER';
    ctaFrame.fills = [{ type: 'SOLID', color: { r: 0.04, g: 0.54, b: 0.3 } }];
    ctaFrame.cornerRadius = CTA_CORNER;
    const ctaLabel = figma.createText();
    ctaLabel.fontName = font;
    ctaLabel.fontSize = FONT_SIZE_CTA;
    ctaLabel.characters = content.cta || 'CTA';
    ctaLabel.textAlignHorizontal = 'CENTER';
    ctaLabel.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    ctaFrame.appendChild(ctaLabel);
    ctaFrame.layoutSizingHorizontal = 'FILL';
    card.appendChild(ctaFrame);

    const legalText = figma.createText();
    legalText.fontName = font;
    legalText.fontSize = FONT_SIZE_LEGAL;
    legalText.characters = content.legalText || '';
    legalText.textAlignHorizontal = 'LEFT';
    legalText.layoutSizingHorizontal = 'FILL';
    legalText.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.45 } }];
    card.appendChild(legalText);

    parent.appendChild(card);
  }

  page.appendChild(parent);

  const selection = figma.currentPage.selection;
  if (selection.length > 0 && selection[0] && 'x' in selection[0] && 'width' in selection[0]) {
    const node = selection[0];
    parent.x = node.x + (node.width ?? 0) + PLACEMENT_GAP;
    parent.y = node.y ?? 0;
  } else {
    const center = figma.viewport.center;
    parent.x = center.x - parent.width / 2;
    parent.y = center.y - parent.height / 2;
  }

  figma.currentPage.selection = [parent];
  figma.viewport.scrollAndZoomIntoView([parent]);
  sendToast('Inserted variants to canvas.');
}

figma.ui.onmessage = async (msg: unknown) => {
  if (typeof msg !== 'object' || msg === null || !('type' in msg)) return;
  const m = msg as MessageFromUI;
  console.log('[Affirm SPAM main] received:', m.type, m);

  try {
    switch (m.type) {
      case 'INIT': {
        state = await loadState();
        sendState();
        break;
      }

      case 'SET_LOCALE': {
        if (isCustomTemplateId(state.selectedTemplateId)) {
          sendToast('Locale is locked for custom templates.');
          break;
        }
        state.locale = m.locale;
        if (state.prototypeState === 'draft-unsaved') state.draftLocale = m.locale;
        state.exportState = 'idle';
        await saveState(state);
        sendState();
        break;
      }

      case 'SET_TONE': {
        state.tone = m.tone;
        state.exportState = 'idle';
        await saveState(state);
        sendState();
        break;
      }

      case 'TOGGLE_VARIANT': {
        const idx = state.selectedVariants.indexOf(m.variant);
        if (idx >= 0) {
          state.selectedVariants = state.selectedVariants.filter((v) => v !== m.variant);
        } else {
          state.selectedVariants = [...state.selectedVariants, m.variant];
        }
        await saveState(state);
        sendState();
        break;
      }

      case 'SELECT_TEMPLATE': {
        state.selectedTemplateId = m.templateId;
        if (!String(m.templateId).startsWith('custom-')) {
          state.templates = { ...state.templates };
          delete state.templates.selectedTemplateLocale;
        }
        state.exportState = 'idle';
        state.isDeprecated = false;
        await saveState(state);
        sendState();
        break;
      }

      case 'START_ADD_TEMPLATE': {
        state.prototypeState = 'draft-unsaved';
        state.draftName = '';
        state.draftLocale = 'es-MX';
        state.draftText = '';
        state.isDraftDirty = false;
        await saveState(state);
        sendState();
        break;
      }

      case 'UPDATE_DRAFT': {
        state.draftName = m.payload.name;
        state.draftLocale = m.payload.locale;
        state.draftText = m.payload.text;
        state.isDraftDirty = true;
        await saveState(state);
        sendState();
        break;
      }

      case 'SAVE_DRAFT': {
        const payload = m.payload;
        const id: TemplateType = `custom-${Date.now()}`;
        const displayName = payload.name || `Payment reminder – ${payload.locale}`;
        const nameForLocales: Record<Locale, string> = {
          'en-US': displayName,
          'en-GB': displayName,
          'es-ES': displayName,
          'es-MX': displayName,
          'pl-PL': displayName,
          'fr-FR': displayName,
        };
        const descriptionForLocales: Record<Locale, string> = {
          'en-US': 'Custom template created from draft',
          'en-GB': 'Custom template created from draft',
          'es-ES': 'Plantilla personalizada creada desde borrador',
          'es-MX': 'Plantilla personalizada creada desde borrador',
          'pl-PL': 'Szablon niestandardowy utworzony z wersji roboczej',
          'fr-FR': 'Modèle personnalisé créé à partir du brouillon',
        };
        const newTemplate: TemplateInfo = {
          id,
          name: nameForLocales,
          description: descriptionForLocales,
          intent: 'Repayments',
        };
        state.templateCatalog = [newTemplate, ...state.templateCatalog];
        state.selectedTemplateId = id;
        state.isBaseTemplate = false;
        state.locale = payload.locale;
        state.prototypeState = 'normal';

        const draftBody = payload.text.trim() || 'No content.';
        const baseContent: EmailContent = {
          greeting: 'Hello {name},',
          body: draftBody,
          footer: '',
          cta: 'Make a payment',
          legalText: 'Loans made or arranged pursuant to applicable law. Affirm Loan Services, LLC.',
        };
        const baseLocale = payload.locale;
        state.customTemplatesContent = {
          ...state.customTemplatesContent,
          [id]: {
            baseLocale,
            locales: {
              [baseLocale]: {
                tone: 'Neutral',
                variants: {
                  A: { ...baseContent },
                  B: { ...baseContent },
                  C: { ...baseContent },
                },
                status: 'custom',
              },
            },
          },
        };
        await saveState(state);
        sendState();
        break;
      }

      case 'CANCEL_DRAFT': {
        state.prototypeState = 'normal';
        await saveState(state);
        sendState();
        break;
      }

      case 'RESOLVE_COMPLIANCE_ISSUE': {
        const arr = state.resolvedComplianceIssues[m.locale] ?? [];
        if (!arr.includes(m.issueIndex)) {
          state.resolvedComplianceIssues = {
            ...state.resolvedComplianceIssues,
            [m.locale]: [...arr, m.issueIndex],
          };
          await saveState(state);
        }
        sendState();
        break;
      }

      case 'EXPORT_SELECTED': {
        if (state.isDeprecated || state.selectedVariants.length === 0) break;
        state.exportState = 'exporting-selected';
        sendState();
        setTimeout(() => {
          state.exportState = 'exported-selected';
          sendState();
          setTimeout(() => {
            state.exportState = 'idle';
            sendState();
          }, 3000);
        }, 800);
        break;
      }

      case 'EXPORT_ALL': {
        if (state.isDeprecated) break;
        state.exportState = 'exporting-all';
        sendState();
        setTimeout(() => {
          state.exportState = 'exported-all';
          sendState();
          setTimeout(() => {
            state.exportState = 'idle';
            sendState();
          }, 3000);
        }, 1000);
        break;
      }

      case 'INSERT_TO_CANVAS': {
        try {
          const payload = buildInsertPayload(state);
          if (!payload) {
            sendError('No template content found.');
            break;
          }
          await insertVariantsToCanvas(payload);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          sendError(message);
          console.error('[Affirm SPAM main] INSERT_TO_CANVAS', err);
        }
        break;
      }

      case 'GENERATE_VARIANTS': {
        state.isGenerating = true;
        state.exportState = 'idle';
        sendState();
        setTimeout(() => {
          state.isGenerating = false;
          sendState();
        }, 1200);
        break;
      }

      case 'TOGGLE_BASE_TEMPLATE': {
        state.isBaseTemplate = !state.isBaseTemplate;
        await saveState(state);
        sendState();
        break;
      }

      case 'DUPLICATE_TEMPLATE': {
        state.isBaseTemplate = false;
        state.exportState = 'idle';
        await saveState(state);
        sendState();
        break;
      }

      case 'MARK_DEPRECATED': {
        state.isDeprecated = true;
        state.exportState = 'idle';
        await saveState(state);
        sendState();
        break;
      }

      case 'RESET_STORAGE': {
        state = getDefaultState();
        await saveState(state);
        sendState();
        sendToast('Storage reset.');
        break;
      }

      case 'CREATE_TRANSLATION': {
        const { templateId, targetLocale } = m;
        if (!templateId || !String(templateId).startsWith('custom-')) break;
        const content = state.customTemplatesContent[templateId];
        if (!content) break;
        const source = content.locales[content.baseLocale];
        if (!source) break;
        const locales = { ...content.locales };
        locales[targetLocale] = {
          tone: source.tone,
          variants: {
            A: { ...source.variants.A },
            B: { ...source.variants.B },
            C: { ...source.variants.C },
          },
          status: 'auto',
        };
        state.customTemplatesContent = {
          ...state.customTemplatesContent,
          [templateId]: { ...content, locales },
        };
        await saveState(state);
        sendState();
        sendToast(`Translation added for ${targetLocale}.`);
        break;
      }

      case 'SELECT_TEMPLATE_LOCALE': {
        const { templateId, locale } = m;
        if (!templateId || !String(templateId).startsWith('custom-') || templateId !== state.selectedTemplateId) break;
        state.templates = { ...state.templates, selectedTemplateLocale: locale };
        await saveState(state);
        sendState();
        break;
      }

      default:
        break;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    sendError(message);
    sendToast(message);
    console.error('[Affirm SPAM main]', e);
  }
};
