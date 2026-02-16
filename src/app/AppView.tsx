import { useEffect, useMemo } from 'react';
import { EmailVariant } from './components/EmailVariant';
import { AffirmLogo } from './components/AffirmLogo';
import { DraftEmailCard } from './components/DraftEmailCard';
import { CommsForgePanel } from './components/CommsForgePanel';
import type { DraftPayload } from './components/TemplateCreationPanel';
import {
  Locale,
  Tone,
  Variant,
  LOCALES,
  localeMetadata,
  complianceRules,
  EmailContent,
} from './data/contentData';
import type { TemplateType, TemplateInfo } from './data/templateData';
import { isCustomTemplateId } from './data/templateData';
import { Check, AlertTriangle } from 'lucide-react';
import type { AppState, MessageFromUI } from 'figma-plugin/messageTypes';
import { RECOMMENDED_VARIANT } from 'figma-plugin/messageTypes';
import { getPreviewOverrides, setPreviewOverride, applyOverridesToContent } from './lib/previewOverrides';
import { exportSingleLocale, exportZipPerLocale } from './lib/exportFormat';
import type { EditableSlot } from './lib/previewOverrides';

const FALLBACK_LOCALE: Locale = 'en-US';
const FALLBACK_TEMPLATE_ID = 'payment-reminder';

const DEFAULT_EMAIL_CONTENT: EmailContent = {
  greeting: 'Hello {name},',
  body: 'Your payment is due. Please make a payment at your earliest convenience.',
  footer: '',
  cta: 'Make a payment',
  legalText: 'Loans made or arranged pursuant to applicable law. Affirm Loan Services, LLC.',
};

type ResolvedIssuesState = Record<Locale, Set<number>>;

export interface GetSystemEmailContentParams {
  templateId: string;
  locale: Locale;
  tone: Tone;
  variant: Variant;
}

export interface AppViewProps {
  state: AppState;
  dispatch: (msg: MessageFromUI) => void;
  getSystemEmailContent: (params: GetSystemEmailContentParams) => EmailContent;
  syncLocaleToI18n?: (locale: Locale) => void;
  onImportTranslations?: (json: string) => void;
  /** Web app only: hide Insert to canvas, enable inline edit + export single/zip */
  isWebApp?: boolean;
  /** Bump to re-read preview overrides from localStorage */
  previewOverrideVersion?: number;
  onPreviewOverrideApplied?: () => void;
}

function applyComplianceReplacements(
  content: EmailContent,
  locale: Locale,
  resolvedIssues: Set<number>
): EmailContent {
  const allIssues = complianceRules[locale] ?? [];
  let updatedContent = { ...content };
  allIssues.forEach((issue, index) => {
    if (resolvedIssues.has(index)) {
      updatedContent = {
        ...updatedContent,
        body: updatedContent.body.replace(issue.problematicPhrase, issue.replacementText),
        warning: updatedContent.warning?.replace(issue.problematicPhrase, issue.replacementText),
      };
    }
  });
  return updatedContent;
}

function resolvedArraysToSets(r: AppState['resolvedComplianceIssues']): ResolvedIssuesState {
  const out: Record<string, Set<number>> = {};
  for (const l of LOCALES) out[l] = new Set(r[l] ?? []);
  return out as ResolvedIssuesState;
}

function safeLocale(loc: string | undefined): Locale {
  if (loc != null && LOCALES.includes(loc as Locale)) return loc as Locale;
  return FALLBACK_LOCALE;
}

/** Export filename date segment: YYYY-MM-DD_HH-mm-ss */
function exportDateSegment(): string {
  const d = new Date();
  const iso = d.toISOString();
  return iso.slice(0, 10) + '_' + iso.slice(11, 19).replace(/:/g, '-');
}

/** Convert EmailContent to export variant shape (no subject in schema). */
function contentToExportVariant(c: EmailContent): Record<string, string> {
  const out: Record<string, string> = {
    greeting: c.greeting,
    body: c.body,
    footer: c.footer,
    cta: c.cta,
    legalText: c.legalText,
  };
  if (c.warning != null && c.warning !== '') out.warning = c.warning;
  return out;
}

function triggerJsonDownload(filename: string, jsonString: string): void {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AppView({
  state,
  dispatch,
  getSystemEmailContent,
  syncLocaleToI18n,
  onImportTranslations,
  isWebApp = false,
  previewOverrideVersion = 0,
  onPreviewOverrideApplied,
}: AppViewProps) {
  const locale = state.locale;
  const tone = state.tone;
  const selectedVariants = state.selectedVariants;
  const selectedTemplate = state.selectedTemplateId;
  const isDraftMode = state.prototypeState === 'draft-unsaved';
  const isAddingNewTemplate = state.prototypeState === 'draft-unsaved';
  const hasNewTemplate = state.prototypeState === 'saved-new-template';
  const resolvedIssues = resolvedArraysToSets(state.resolvedComplianceIssues);

  useEffect(() => {
    syncLocaleToI18n?.(locale);
  }, [locale, syncLocaleToI18n]);

  const getTemplateById = (id: TemplateType): TemplateInfo | undefined =>
    state.templateCatalog.find((t) => t.id === id);

  const selectedId = state.selectedTemplateId;
  const customContent =
    selectedId && isCustomTemplateId(selectedId) && state.customTemplatesContent[selectedId] != null
      ? state.customTemplatesContent[selectedId]
      : null;
  const effectiveCustomLocale = safeLocale(
    customContent != null
      ? (state.templates != null && state.templates.selectedTemplateLocale != null
          ? state.templates.selectedTemplateLocale
          : customContent.baseLocale)
      : locale
  );
  const localeEntry =
    customContent != null
      ? (customContent.locales[effectiveCustomLocale] ||
          customContent.locales[customContent.baseLocale] ||
          customContent.locales[FALLBACK_LOCALE])
      : null;
  const customVariants = localeEntry?.variants ?? null;

  const availableExportLocales = useMemo(() => {
    const fromCustom = Object.values(state.customTemplatesContent ?? {}).flatMap((c) =>
      Object.keys(c.locales) as Locale[]
    );
    const union = [...new Set(fromCustom)];
    return union.length > 0 ? union.sort() : [...LOCALES];
  }, [state.customTemplatesContent]);

  function getVariantContent(variant: Variant): { content: EmailContent; usedFallback: boolean } {
    const fromCustom = customVariants?.[variant];
    if (fromCustom) return { content: fromCustom, usedFallback: false };
    try {
      const templateId = customContent ? FALLBACK_TEMPLATE_ID : state.selectedTemplateId;
      const loc = customContent ? FALLBACK_LOCALE : locale;
      const content = getSystemEmailContent({ templateId, locale: loc, tone, variant });
      return { content, usedFallback: !!customContent };
    } catch {
      return { content: DEFAULT_EMAIL_CONTENT, usedFallback: true };
    }
  }
  const variantA = getVariantContent('A');
  const variantB = getVariantContent('B');
  const variantC = getVariantContent('C');
  const isShowingFallback = variantA.usedFallback || variantB.usedFallback || variantC.usedFallback;

  const contentLocale = safeLocale(customContent ? effectiveCustomLocale : locale);
  const resolvedSet = resolvedIssues[contentLocale] ?? new Set<number>();

  const generatedMatches =
    state.generated != null &&
    state.generated.templateId === selectedTemplate &&
    state.generated.locale === contentLocale &&
    state.generated.tone === tone;

  const contentForDisplayA = generatedMatches ? state.generated!.variants.A : variantA.content;
  const contentForDisplayB = generatedMatches ? state.generated!.variants.B : variantB.content;
  const contentForDisplayC = generatedMatches ? state.generated!.variants.C : variantC.content;

  const variantAContentWithReplacements = applyComplianceReplacements(contentForDisplayA, contentLocale, resolvedSet);
  const variantBContentWithReplacements = applyComplianceReplacements(contentForDisplayB, contentLocale, resolvedSet);
  const variantCContentWithReplacements = applyComplianceReplacements(contentForDisplayC, contentLocale, resolvedSet);

  const layoutModeForOverrides = state.layoutMode ?? 'affirm';
  const overrideKeyBase = { templateId: selectedTemplate, locale: contentLocale, layoutMode: layoutModeForOverrides, tone };
  const overridesA = isWebApp ? getPreviewOverrides({ ...overrideKeyBase, variantId: 'A' }) : {};
  const overridesB = isWebApp ? getPreviewOverrides({ ...overrideKeyBase, variantId: 'B' }) : {};
  const overridesC = isWebApp ? getPreviewOverrides({ ...overrideKeyBase, variantId: 'C' }) : {};
  const contentForMainA = isWebApp ? applyOverridesToContent(variantAContentWithReplacements, overridesA) : variantAContentWithReplacements;
  const contentForMainB = isWebApp ? applyOverridesToContent(variantBContentWithReplacements, overridesB) : variantBContentWithReplacements;
  const contentForMainC = isWebApp ? applyOverridesToContent(variantCContentWithReplacements, overridesC) : variantCContentWithReplacements;

  const showWarningB =
    (contentLocale === 'es-ES' || contentLocale === 'es-MX') && (tone === 'Neutral' || tone === 'Firm') && !!contentForDisplayB.warning;
  const showWarningUK = contentLocale === 'en-GB' && tone === 'Firm' && !!contentForDisplayB.warning;
  const currentComplianceIssues = complianceRules[contentLocale] ?? [];
  const activeComplianceIssues = currentComplianceIssues.filter((_, index) => !resolvedSet.has(index));

  function handleInsertToCanvas() {
    dispatch({ type: 'INSERT_TO_CANVAS' });
  }

  /** Web app: get content for a locale with preview overrides applied (for export). */
  function getContentForLocaleWithOverrides(loc: Locale): Record<Variant, EmailContent> {
    const layoutMode = state.layoutMode ?? 'affirm';
    const keyBase = { templateId: selectedTemplate, locale: loc, layoutMode, tone };
    const getBase = (variant: Variant): EmailContent => {
      if (customContent) {
        const entry = customContent.locales[loc] ?? customContent.locales[customContent.baseLocale] ?? customContent.locales[FALLBACK_LOCALE];
        const c = entry?.variants[variant];
        if (c) return c;
      }
      try {
        return getSystemEmailContent({ templateId: selectedTemplate, locale: loc, tone, variant });
      } catch {
        return DEFAULT_EMAIL_CONTENT;
      }
    };
    const overridesA = getPreviewOverrides({ ...keyBase, variantId: 'A' });
    const overridesB = getPreviewOverrides({ ...keyBase, variantId: 'B' });
    const overridesC = getPreviewOverrides({ ...keyBase, variantId: 'C' });
    return {
      A: applyOverridesToContent(getBase('A'), overridesA),
      B: applyOverridesToContent(getBase('B'), overridesB),
      C: applyOverridesToContent(getBase('C'), overridesC),
    };
  }

  /** Web app: export single JSON (current locale) or ZIP (multiple locales). */
  async function handleExportForWeb(format: 'single' | 'per_locale', exportLocales: Locale[]) {
    const layoutMode = state.layoutMode ?? 'affirm';
    const templateInfo = getTemplateById(selectedTemplate);
    const templateMeta = {
      id: selectedTemplate,
      name: templateInfo?.name?.[contentLocale] ?? templateInfo?.name?.['en-US'] ?? selectedTemplate,
      intent: templateInfo?.intent ?? '',
      isCustom: !!(selectedTemplate && isCustomTemplateId(selectedTemplate)),
      isDeprecated: !!state.isDeprecated,
    };
    if (format === 'single' || exportLocales.length <= 1) {
      const loc = format === 'single' ? contentLocale : exportLocales[0];
      const variants = getContentForLocaleWithOverrides(loc);
      exportSingleLocale({
        templateId: selectedTemplate,
        locale: loc,
        tone,
        layoutMode,
        template: templateMeta,
        variants,
      });
    } else {
      const localeVariants = exportLocales.map((locale) => ({
        locale,
        variants: getContentForLocaleWithOverrides(locale),
      }));
      await exportZipPerLocale({
        templateId: selectedTemplate,
        tone,
        layoutMode,
        template: templateMeta,
        localeVariants,
      });
    }
  }

  function handlePreviewEdit(variant: import('figma-plugin/messageTypes').Variant, slot: EditableSlot, value: string) {
    const key = {
      templateId: selectedTemplate,
      locale: contentLocale,
      variantId: variant,
      layoutMode: state.layoutMode ?? 'affirm',
      tone,
    };
    setPreviewOverride(key, slot, value);
    onPreviewOverrideApplied?.();
  }

  function handleExportSelected() {
    if (!state.generated) {
      dispatch({ type: 'SHOW_TOAST', message: 'Generate first.' });
      return;
    }
    if (selectedVariants.length === 0) {
      dispatch({ type: 'SHOW_TOAST', message: 'Generate first.' });
      return;
    }
    const templateInfo = getTemplateById(selectedTemplate);
    const displayName = templateInfo?.name?.[contentLocale] ?? templateInfo?.name?.['en-US'] ?? selectedTemplate;
    const layoutMode = state.layoutMode ?? 'affirm';
    const variants: Record<string, Record<string, string>> = {};
    const contents = {
      A: variantAContentWithReplacements,
      B: variantBContentWithReplacements,
      C: variantCContentWithReplacements,
    };
    for (const v of selectedVariants) {
      variants[v] = contentToExportVariant(contents[v]);
    }
    const payload = {
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      template: {
        id: selectedTemplate,
        name: displayName,
        intent: templateInfo?.intent ?? '',
        isCustom: !!(selectedTemplate && isCustomTemplateId(selectedTemplate)),
        isDeprecated: !!state.isDeprecated,
      },
      context: {
        locale: contentLocale,
        tone,
        layoutMode,
        recommendedVariant: RECOMMENDED_VARIANT,
      },
      variants,
    };
    const filename = `affirm-spam__${selectedTemplate}__${contentLocale}__${tone}__${layoutMode}__selected__${exportDateSegment()}.json`;
    triggerJsonDownload(filename, JSON.stringify(payload, null, 2));
    dispatch({ type: 'EXPORT_SELECTED' });
  }

  function handleExportAll() {
    if (!state.generated) {
      dispatch({ type: 'SHOW_TOAST', message: 'Generate first.' });
      return;
    }
    const templateInfo = getTemplateById(selectedTemplate);
    const displayName = templateInfo?.name?.[contentLocale] ?? templateInfo?.name?.['en-US'] ?? selectedTemplate;
    const layoutMode = state.layoutMode ?? 'affirm';
    const payload = {
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      template: {
        id: selectedTemplate,
        name: displayName,
        intent: templateInfo?.intent ?? '',
        isCustom: !!(selectedTemplate && isCustomTemplateId(selectedTemplate)),
        isDeprecated: !!state.isDeprecated,
      },
      context: {
        locale: contentLocale,
        tone,
        layoutMode,
        recommendedVariant: RECOMMENDED_VARIANT,
      },
      variants: {
        A: contentToExportVariant(variantAContentWithReplacements),
        B: contentToExportVariant(variantBContentWithReplacements),
        C: contentToExportVariant(variantCContentWithReplacements),
      },
    };
    const filename = `affirm-spam__${selectedTemplate}__${contentLocale}__${tone}__${layoutMode}__all__${exportDateSegment()}.json`;
    triggerJsonDownload(filename, JSON.stringify(payload, null, 2));
    dispatch({ type: 'EXPORT_ALL' });
  }

  function handleExportTranslations() {
    const templateInfo = getTemplateById(selectedTemplate);
    const displayName = templateInfo?.name?.[contentLocale] ?? templateInfo?.name?.['en-US'] ?? selectedTemplate;
    const layoutMode = state.layoutMode ?? 'affirm';
    const templateMeta = {
      id: selectedTemplate,
      name: displayName,
      intent: templateInfo?.intent ?? '',
      isCustom: !!(selectedTemplate && isCustomTemplateId(selectedTemplate)),
      isDeprecated: !!state.isDeprecated,
    };
    if (selectedTemplate && isCustomTemplateId(selectedTemplate)) {
      const custom = state.customTemplatesContent[selectedTemplate];
      if (!custom) {
        dispatch({ type: 'SHOW_TOAST', message: 'Template content not found.' });
        return;
      }
      const localesPayload: Record<string, Record<string, Record<string, string>>> = {};
      for (const loc of Object.keys(custom.locales) as Locale[]) {
        const entry = custom.locales[loc];
        if (!entry) continue;
        localesPayload[loc] = {
          A: contentToExportVariant(entry.variants.A),
          B: contentToExportVariant(entry.variants.B),
          C: contentToExportVariant(entry.variants.C),
        };
      }
      const payload = {
        exportVersion: 1,
        exportedAt: new Date().toISOString(),
        template: templateMeta,
        context: { locale: contentLocale, tone, layoutMode, recommendedVariant: RECOMMENDED_VARIANT },
        locales: localesPayload,
      };
      const filename = `affirm-spam__${selectedTemplate}__translations__${exportDateSegment()}.json`;
      triggerJsonDownload(filename, JSON.stringify(payload, null, 2));
      dispatch({ type: 'SHOW_TOAST', message: 'Exported JSON' });
      return;
    }
    if (!state.generated) {
      dispatch({ type: 'SHOW_TOAST', message: 'Generate first.' });
      return;
    }
    const payload = {
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      template: templateMeta,
      context: {
        locale: contentLocale,
        tone,
        layoutMode,
        recommendedVariant: RECOMMENDED_VARIANT,
      },
      variants: {
        A: contentToExportVariant(variantAContentWithReplacements),
        B: contentToExportVariant(variantBContentWithReplacements),
        C: contentToExportVariant(variantCContentWithReplacements),
      },
    };
    const filename = `affirm-spam__${selectedTemplate}__translations__${exportDateSegment()}.json`;
    triggerJsonDownload(filename, JSON.stringify(payload, null, 2));
    dispatch({ type: 'SHOW_TOAST', message: 'Exported JSON' });
  }

  return (
    <div
      className="flex h-full min-h-0 plugin-app-root"
      style={{
        backgroundColor: 'var(--background)',
        fontFamily: 'Calibre, sans-serif',
      }}
    >
      <div className="app-view__main flex-1 overflow-auto min-w-0">
        <div className="p-8 flex flex-col items-center">
          {isShowingFallback && (
            <div
              role="status"
              className="mb-4 w-full max-w-[1400px]"
              style={{
                padding: '10px 14px',
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-sm, 14px)',
                color: 'var(--foreground)',
                backgroundColor: 'rgba(250, 204, 21, 0.15)',
                border: '1px solid rgba(250, 204, 21, 0.4)',
                borderRadius: 'var(--radius-sm, 6px)',
              }}
            >
              Template content not available for selected locale, showing fallback.
            </div>
          )}
          <div className="mb-6 w-full max-w-[1400px]" style={{ fontFamily: 'Calibre, sans-serif' }}>
            {isWebApp ? (
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  if (e.altKey) dispatch({ type: 'RESET_STORAGE' });
                }}
                onKeyDown={(e) => {
                  if (e.altKey && e.key === 'Enter') dispatch({ type: 'RESET_STORAGE' });
                }}
                style={{ display: 'inline-block', cursor: 'pointer' }}
              >
                <AffirmLogo />
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    if (e.altKey) dispatch({ type: 'RESET_STORAGE' });
                  }}
                  style={{
                    display: 'block',
                    marginBottom: '2px',
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--foreground)',
                    textAlign: 'left',
                  }}
                >
                  Affirm SPAM
                </button>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                  Structured Payments & Messaging
                </div>
              </>
            )}
          </div>

          {isDraftMode ? (
            <div className="flex justify-center max-w-[1400px] w-full">
              <div className="w-full max-w-[450px]">
                <DraftEmailCard
                  draftText={state.draftText}
                  templateName={state.draftName}
                  locale={state.draftLocale}
                  previewDevice={state.previewDevice ?? 'desktop'}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6 max-w-[1400px] w-full">
              <EmailVariant
                variant="A"
                tone={tone}
                content={contentForMainA}
                isSelected={selectedVariants.includes('A')}
                variantId="variant-A"
                complianceIssues={activeComplianceIssues}
                locale={locale}
                previewDevice={state.previewDevice ?? 'desktop'}
                editable={isWebApp}
                onEdit={isWebApp ? (slot, value) => handlePreviewEdit('A', slot, value) : undefined}
              />
              <EmailVariant
                variant="B"
                tone={tone}
                content={contentForMainB}
                hasWarning={showWarningB || showWarningUK}
                isSelected={selectedVariants.includes('B')}
                variantId="variant-B"
                complianceIssues={activeComplianceIssues}
                locale={locale}
                previewDevice={state.previewDevice ?? 'desktop'}
                editable={isWebApp}
                onEdit={isWebApp ? (slot, value) => handlePreviewEdit('B', slot, value) : undefined}
              />
              <EmailVariant
                variant="C"
                tone={tone}
                content={contentForMainC}
                isSelected={selectedVariants.includes('C')}
                variantId="variant-C"
                complianceIssues={activeComplianceIssues}
                locale={locale}
                previewDevice={state.previewDevice ?? 'desktop'}
                editable={isWebApp}
                onEdit={isWebApp ? (slot, value) => handlePreviewEdit('C', slot, value) : undefined}
              />
            </div>
          )}

          {!isDraftMode && (
            <CompliancePanel
              locale={contentLocale}
              resolvedIssues={resolvedIssues}
              onResolveIssue={(loc, issueIndex) =>
                dispatch({ type: 'RESOLVE_COMPLIANCE_ISSUE', locale: loc, issueIndex })
              }
            />
          )}

          <div
            className="mt-6 text-center space-y-1 w-full max-w-[1400px]"
            style={{
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            <div>Created with Affirm SPAM · {localeMetadata[locale]} locale</div>
            <div>Demo mode · No customer data used</div>
            <div>Debug: locale={locale} template={selectedTemplate}</div>
          </div>
        </div>
      </div>

      <div className="app-view__panel flex-shrink-0 min-w-0">
      <CommsForgePanel
        locale={locale}
        tone={tone}
        layoutMode={state.layoutMode ?? 'affirm'}
        onLayoutModeChange={(mode) => dispatch({ type: 'SET_LAYOUT_MODE', layoutMode: mode })}
        previewDevice={state.previewDevice ?? 'desktop'}
        onPreviewDeviceChange={(device) => dispatch({ type: 'SET_PREVIEW_DEVICE', previewDevice: device })}
        selectedVariants={selectedVariants}
        isGenerating={state.isGenerating}
        exportState={state.exportState}
        lastExportedAt={state.lastExportedAt ?? null}
        hasGenerated={!!state.generated}
        selectedTemplate={selectedTemplate}
        isBaseTemplate={state.isBaseTemplate}
        isDeprecated={state.isDeprecated}
        isAddingNewTemplate={isAddingNewTemplate}
        hasNewTemplate={hasNewTemplate}
        onLocaleChange={(l) => dispatch({ type: 'SET_LOCALE', locale: l })}
        onToneChange={(t) => dispatch({ type: 'SET_TONE', tone: t })}
        onVariantToggle={(v) => dispatch({ type: 'TOGGLE_VARIANT', variant: v })}
        onGenerate={() => dispatch({ type: 'GENERATE_VARIANTS' })}
        onExportSelected={handleExportSelected}
        onExportAll={handleExportAll}
        onInsertToCanvas={handleInsertToCanvas}
        isWebApp={isWebApp}
        previewOverrideVersion={previewOverrideVersion}
        onPreviewEdit={isWebApp ? handlePreviewEdit : undefined}
        onExportJson={isWebApp ? handleExportForWeb : undefined}
        generated={state.generated}
        generatedMatches={generatedMatches}
        contentLocale={contentLocale}
        onTemplateChange={(id) => dispatch({ type: 'SELECT_TEMPLATE', templateId: id })}
        onToggleBaseTemplate={() => dispatch({ type: 'TOGGLE_BASE_TEMPLATE' })}
        onDuplicateTemplate={() => dispatch({ type: 'DUPLICATE_TEMPLATE' })}
        onRenameTemplate={() => {}}
        onRenameSubmit={(name) => dispatch({ type: 'RENAME_TEMPLATE', name })}
        onDeleteTemplate={() => dispatch({ type: 'DELETE_TEMPLATE' })}
        onMarkDeprecated={() => dispatch({ type: 'MARK_DEPRECATED' })}
        onAddNewTemplate={() => dispatch({ type: 'START_ADD_TEMPLATE' })}
        onCancelNewTemplate={() => dispatch({ type: 'CANCEL_DRAFT' })}
        onDraftChange={(payload: DraftPayload) => dispatch({ type: 'UPDATE_DRAFT', payload })}
        onSaveTemplate={(payload: DraftPayload) => dispatch({ type: 'SAVE_DRAFT', payload })}
        templateCatalog={state.templateCatalog}
        getTemplateById={getTemplateById}
        onExportTranslations={handleExportTranslations}
        onImportTranslations={onImportTranslations ?? (() => {})}
        isCustomTemplateSelected={!!(selectedTemplate && isCustomTemplateId(selectedTemplate))}
        ui={state.ui}
        customTemplateLocales={
          customContent
            ? (Object.keys(customContent.locales) as Locale[])
            : []
        }
        customTemplateBaseLocale={customContent?.baseLocale}
        selectedTemplateLocale={state.templates?.selectedTemplateLocale}
        onSelectTemplateLocale={(locale) =>
          selectedTemplate
            ? dispatch({ type: 'SELECT_TEMPLATE_LOCALE', templateId: selectedTemplate, locale })
            : undefined
        }
        onCreateTranslation={(targetLocale) =>
          selectedTemplate
            ? dispatch({ type: 'CREATE_TRANSLATION', templateId: selectedTemplate, targetLocale })
            : undefined
        }
        onSyncToFile={() => dispatch({ type: 'SYNC_TO_FILE' })}
        onPullFromFile={() => dispatch({ type: 'PULL_FROM_FILE' })}
        onDownloadLibraryJson={(payload) =>
          dispatch({
            type: 'DOWNLOAD_LIBRARY_JSON',
            format: payload.format,
            locales: payload.locales,
          })
        }
        availableExportLocales={availableExportLocales}
        syncMeta={state.syncMeta}
        autoSyncToFile={state.settings?.autoSyncToFile ?? false}
        onAutoSyncChange={(enabled) => dispatch({ type: 'SET_AUTO_SYNC', enabled })}
        libraryStatus={state.libraryStatus}
      />
      </div>
    </div>
  );
}

interface CompliancePanelProps {
  locale: Locale;
  resolvedIssues: ResolvedIssuesState;
  onResolveIssue: (locale: Locale, issueIndex: number) => void;
}

function CompliancePanel({ locale, resolvedIssues, onResolveIssue }: CompliancePanelProps) {
  const complianceIssues = complianceRules[locale] ?? [];
  const resolvedSet = resolvedIssues[locale] ?? new Set<number>();
  const activeIssues = complianceIssues.filter((_, index) => !resolvedSet.has(index));
  const hasActiveCompliance = activeIssues && activeIssues.length > 0;

  return (
    <div
      className="mt-8 max-w-[1400px] w-full"
      style={{
        padding: '16px',
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="mb-3"
        style={{
          fontFamily: 'Axiforma, sans-serif',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--foreground)',
        }}
      >
        Compliance
      </div>
      <div
        className="mb-4"
        style={{
          fontFamily: 'Calibre, sans-serif',
          fontSize: 'var(--text-sm)',
          color: 'var(--muted-foreground)',
        }}
      >
        Checks run automatically on copy changes.
      </div>
      <div
        className="flex items-center gap-2 mb-3"
        style={{
          padding: '12px',
          backgroundColor: 'rgba(10, 137, 76, 0.05)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(10, 137, 76, 0.2)',
        }}
      >
        <Check size={18} style={{ color: 'rgba(10, 137, 76, 1)', flexShrink: 0 }} />
        <span
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--foreground)',
          }}
        >
          No UDAAP issues detected
        </span>
      </div>
      {hasActiveCompliance &&
        complianceIssues.map((issue, index) => {
          if (resolvedSet.has(index)) return null;
          return (
            <div
              key={index}
              className="flex items-start gap-3 mb-3"
              style={{
                padding: '12px',
                backgroundColor: 'rgba(232, 140, 49, 0.04)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(232, 140, 49, 0.15)',
              }}
            >
              <AlertTriangle
                size={18}
                style={{ color: 'rgba(232, 140, 49, 1)', marginTop: '2px', flexShrink: 0 }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    style={{
                      fontFamily: 'Calibre, sans-serif',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {issue.phrase}
                  </span>
                  <span
                    className="inline-flex px-2 py-0.5"
                    style={{
                      fontFamily: 'Calibre, sans-serif',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'rgba(232, 140, 49, 1)',
                      backgroundColor: 'rgba(232, 140, 49, 0.1)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {issue.level}
                  </span>
                </div>
                <div
                  className="mb-2"
                  style={{
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  {issue.suggestion}
                </div>
                <button
                  onClick={() => onResolveIssue(locale, index)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  style={{
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'rgba(232, 140, 49, 1)',
                    background: 'none',
                    border: 'none',
                    padding: '0',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Apply recommended wording
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}
