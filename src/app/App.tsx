import { useState, useEffect } from 'react';
import { AppView } from './AppView';
import { HandoffDocumentation } from './components/HandoffDocumentation';
import { TokensDocumentation } from './components/TokensDocumentation';
import { Locale, Tone, Variant, EmailContent, LOCALES } from './data/contentData';
import { TemplateType, TemplateInfo, templates as initialTemplates, isCustomTemplateId } from './data/templateData';
import { getSystemEmailContent as getSystemEmailContentI18n } from './i18n/getSystemEmailContent';
import i18n from './i18n/config';
import type { AppState, MessageFromUI, CustomTemplateContent, GeneratedState } from 'figma-plugin/messageTypes';

type ResolvedIssuesState = { [K in Locale]: Set<number> };
type CustomTemplatesContentState = { [key: string]: CustomTemplateContent };

const DEFAULT_DRAFT_TEXT = '';
const initialResolvedIssues: ResolvedIssuesState = Object.fromEntries(LOCALES.map((l) => [l, new Set<number>()])) as ResolvedIssuesState;

const LOCALE_LOCK_REASON = 'Locale is locked for custom templates. Create a translation to add another locale.';

function stateToAppState(
  locale: Locale,
  tone: Tone,
  selectedVariants: Variant[],
  selectedTemplateId: TemplateType,
  isBaseTemplate: boolean,
  isDeprecated: boolean,
  prototypeState: 'normal' | 'draft-unsaved' | 'saved-new-template',
  draftName: string,
  draftLocale: Locale,
  draftText: string,
  isDraftDirty: boolean,
  templateCatalog: TemplateInfo[],
  customTemplatesContent: CustomTemplatesContentState,
  resolvedIssues: ResolvedIssuesState,
  exportState: AppState['exportState'],
  isGenerating: boolean,
  selectedTemplateLocale: Locale | undefined,
  generated: AppState['generated'],
  layoutMode: AppState['layoutMode'],
  previewDevice: AppState['previewDevice']
): AppState {
  const resolvedArrays: AppState['resolvedComplianceIssues'] = Object.fromEntries(
    LOCALES.map((l) => [l, [...(resolvedIssues[l] ?? [])]])
  ) as AppState['resolvedComplianceIssues'];
  const isCustom = selectedTemplateId != null && isCustomTemplateId(selectedTemplateId);
  const isDraftMode = prototypeState === 'draft-unsaved';
  const isLocaleSelectorDisabled = !isDraftMode && isCustom;
  return {
    locale,
    tone,
    layoutMode,
    previewDevice,
    selectedVariants,
    selectedTemplateId,
    isBaseTemplate,
    isDeprecated,
    prototypeState,
    draftName,
    draftLocale,
    draftText,
    isDraftDirty,
    templateCatalog,
    customTemplatesContent,
    resolvedComplianceIssues: resolvedArrays,
    exportState,
    isGenerating,
    generated: generated ?? undefined,
    ui: { isLocaleSelectorDisabled, localeLockReason: isLocaleSelectorDisabled ? LOCALE_LOCK_REASON : undefined },
    templates: { selectedTemplateLocale: selectedTemplateLocale ?? undefined },
  };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'handoff' | 'tokens'>('main');
  const [locale, setLocale] = useState<Locale>('es-ES');
  const [tone, setTone] = useState<Tone>('Neutral');
  const [selectedVariants, setSelectedVariants] = useState<Variant[]>(['B']);
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateType>('demo');
  const [isBaseTemplate, setIsBaseTemplate] = useState(true);
  const [isDeprecated, setIsDeprecated] = useState(false);
  const [prototypeState, setPrototypeState] = useState<'normal' | 'draft-unsaved' | 'saved-new-template'>('normal');
  const [draftName, setDraftName] = useState('');
  const [draftLocale, setDraftLocale] = useState<Locale>('es-MX');
  const [draftText, setDraftText] = useState(DEFAULT_DRAFT_TEXT);
  const [isDraftDirty, setIsDraftDirty] = useState(false);
  const [templateCatalog, setTemplateCatalog] = useState<TemplateInfo[]>(initialTemplates);
  const [customTemplatesContent, setCustomTemplatesContent] = useState<CustomTemplatesContentState>({});
  const [resolvedIssues, setResolvedIssues] = useState<ResolvedIssuesState>(initialResolvedIssues);
  const [exportState, setExportState] = useState<AppState['exportState']>('idle');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplateLocale, setSelectedTemplateLocale] = useState<Locale | undefined>(undefined);
  const [generated, setGenerated] = useState<GeneratedState | null>(null);
  const [layoutMode, setLayoutMode] = useState<AppState['layoutMode']>('affirm');
  const [previewDevice, setPreviewDevice] = useState<AppState['previewDevice']>('desktop');
  const [previewOverrideVersion, setPreviewOverrideVersion] = useState(0);

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash === '#handoff' || hash === '#99') setCurrentPage('handoff');
      else if (hash === '#tokens' || hash === '#98') setCurrentPage('tokens');
      else setCurrentPage('main');
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (currentPage === 'handoff') return <HandoffDocumentation />;
  if (currentPage === 'tokens') return <TokensDocumentation />;

  const state = stateToAppState(
    locale,
    tone,
    selectedVariants,
    selectedTemplateId,
    isBaseTemplate,
    isDeprecated,
    prototypeState,
    draftName,
    draftLocale,
    draftText,
    isDraftDirty,
    templateCatalog,
    customTemplatesContent,
    resolvedIssues,
    exportState,
    isGenerating,
    selectedTemplateLocale,
    generated,
    layoutMode,
    previewDevice
  );

  const dispatch: (msg: MessageFromUI) => void = (msg) => {
    switch (msg.type) {
      case 'SET_LOCALE':
        if (selectedTemplateId && isCustomTemplateId(selectedTemplateId)) break;
        setLocale(msg.locale);
        i18n.changeLanguage(msg.locale);
        if (prototypeState === 'draft-unsaved') setDraftLocale(msg.locale);
        setExportState('idle');
        setGenerated(null);
        break;
      case 'SET_TONE':
        setTone(msg.tone);
        setExportState('idle');
        setGenerated(null);
        break;
      case 'TOGGLE_VARIANT': {
        if (selectedVariants.includes(msg.variant)) {
          setSelectedVariants(selectedVariants.filter((v) => v !== msg.variant));
        } else {
          setSelectedVariants([...selectedVariants, msg.variant]);
        }
        break;
      }
      case 'SELECT_TEMPLATE':
        setSelectedTemplateId(msg.templateId);
        if (!isCustomTemplateId(msg.templateId)) setSelectedTemplateLocale(undefined);
        setExportState('idle');
        setIsDeprecated(false);
        setGenerated(null);
        break;
      case 'START_ADD_TEMPLATE':
        setPrototypeState('draft-unsaved');
        setDraftName('');
        setDraftLocale('es-MX');
        setDraftText('');
        setIsDraftDirty(false);
        break;
      case 'UPDATE_DRAFT':
        setDraftName(msg.payload.name);
        setDraftLocale(msg.payload.locale);
        setDraftText(msg.payload.text);
        setIsDraftDirty(true);
        break;
      case 'SAVE_DRAFT': {
        const payload = msg.payload;
        const id: TemplateType = `custom-${Date.now()}`;
        const displayName = payload.name || `Payment reminder – ${payload.locale}`;
        const CUSTOM_DESCRIPTION: Record<Locale, string> = {
          'en-US': 'Custom template created from draft',
          'en-GB': 'Custom template created from draft',
          'es-ES': 'Plantilla personalizada creada desde borrador',
          'es-MX': 'Plantilla personalizada creada desde borrador',
          'pl-PL': 'Szablon niestandardowy utworzony z wersji roboczej',
          'fr-FR': 'Modèle personnalisé créé à partir du brouillon',
        };
        const nameForLocales = Object.fromEntries(LOCALES.map((l) => [l, displayName])) as Record<Locale, string>;
        const descriptionForLocales = Object.fromEntries(LOCALES.map((l) => [l, CUSTOM_DESCRIPTION[l]])) as Record<Locale, string>;
        const newTemplate: TemplateInfo = {
          id,
          name: nameForLocales,
          description: descriptionForLocales,
          intent: 'Repayments',
        };
        setTemplateCatalog((prev) => [newTemplate, ...prev]);
        setSelectedTemplateId(id);
        setIsBaseTemplate(false);
        setLocale(payload.locale);
        setPrototypeState('normal');
        const draftBody = payload.text.trim() || 'No content.';
        const baseContent: EmailContent = {
          greeting: 'Hello {name},',
          body: draftBody,
          footer: '',
          cta: 'Make a payment',
          legalText: 'Loans made or arranged pursuant to applicable law. Affirm Loan Services, LLC.',
        };
        const baseLocale = payload.locale;
        setCustomTemplatesContent((prev) => ({
          ...prev,
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
        }));
        break;
      }
      case 'CANCEL_DRAFT':
        setPrototypeState('normal');
        break;
      case 'RESOLVE_COMPLIANCE_ISSUE': {
        setResolvedIssues((prev) => {
          const next = { ...prev };
          const set = new Set(prev[msg.locale]);
          set.add(msg.issueIndex);
          next[msg.locale] = set;
          return next;
        });
        break;
      }
      case 'EXPORT_SELECTED':
        if (isDeprecated || selectedVariants.length === 0) break;
        setExportState('exporting-selected');
        runExportStateFlow('exported-selected', 800, 3000);
        break;
      case 'EXPORT_ALL':
        if (isDeprecated) break;
        setExportState('exporting-all');
        runExportStateFlow('exported-all', 1000, 3000);
        break;
      case 'GENERATE_VARIANTS': {
        setIsGenerating(true);
        const tid = selectedTemplateId;
        const templateInfo = templateCatalog.find((t) => t.id === tid);
        const custom = customTemplatesContent[tid];
        if (isCustomTemplateId(tid) && custom) {
          const reqLoc = selectedTemplateLocale ?? custom.baseLocale;
          const localeEntry = custom.locales[reqLoc] ?? custom.locales[custom.baseLocale];
          const effectiveLocale = (localeEntry ? reqLoc : custom.baseLocale) as Locale;
          const variants = (custom.locales[effectiveLocale] ?? custom.locales[custom.baseLocale])?.variants;
          if (variants) {
            const signature = `${tid}|${effectiveLocale}|${tone}`;
            const templateName =
              (templateInfo?.name?.[effectiveLocale] != null) ? templateInfo.name[effectiveLocale]
              : (templateInfo?.name?.['en-US'] != null) ? templateInfo.name['en-US']
              : String(tid);
            setGenerated({
              templateId: tid,
              templateName,
              locale: effectiveLocale,
              tone,
              variants: { A: variants.A, B: variants.B, C: variants.C },
              generatedAt: Date.now(),
              signature,
            });
          } else {
            setGenerated(null);
          }
        } else {
          try {
            const variants: Record<'A' | 'B' | 'C', EmailContent> = {
              A: getSystemEmailContentI18n(tid, locale, tone, 'A'),
              B: getSystemEmailContentI18n(tid, locale, tone, 'B'),
              C: getSystemEmailContentI18n(tid, locale, tone, 'C'),
            };
            const signature = `${tid}|${locale}|${tone}`;
            const templateName =
              (templateInfo?.name?.[locale] != null) ? templateInfo.name[locale]
              : (templateInfo?.name?.['en-US'] != null) ? templateInfo.name['en-US']
              : String(tid);
            setGenerated({
              templateId: tid,
              templateName,
              locale,
              tone,
              variants,
              generatedAt: Date.now(),
              signature,
            });
          } catch (_) {
            setGenerated(null);
          }
        }
        setIsGenerating(false);
        break;
      }
      case 'SET_LAYOUT_MODE':
        setLayoutMode(msg.layoutMode);
        break;
      case 'SET_PREVIEW_DEVICE':
        setPreviewDevice(msg.previewDevice);
        break;
      case 'INSERT_TO_CANVAS':
        // No-op in standalone web app; plugin main thread does real insertion.
        break;
      case 'TOGGLE_BASE_TEMPLATE':
        setIsBaseTemplate((b) => !b);
        break;
      case 'DUPLICATE_TEMPLATE':
        setIsBaseTemplate(false);
        setExportState('idle');
        break;
      case 'MARK_DEPRECATED':
        setIsDeprecated(true);
        setExportState('idle');
        break;
      case 'RESET_STORAGE':
        break;
      case 'SELECT_TEMPLATE_LOCALE':
        if (msg.templateId && isCustomTemplateId(msg.templateId) && msg.templateId === selectedTemplateId) {
          setSelectedTemplateLocale(msg.locale);
          setGenerated(null);
        }
        break;
      case 'CREATE_TRANSLATION': {
        const { templateId, targetLocale } = msg;
        if (!templateId || !isCustomTemplateId(templateId)) break;
        const content = customTemplatesContent[templateId];
        if (!content) break;
        const source = content.locales[content.baseLocale];
        if (!source) break;
        setCustomTemplatesContent((prev) => {
          const cur = prev[templateId];
          if (!cur) return prev;
          const locales = { ...cur.locales };
          locales[targetLocale] = {
            tone: source.tone,
            variants: {
              A: { ...source.variants.A },
              B: { ...source.variants.B },
              C: { ...source.variants.C },
            },
            status: 'auto',
          };
          return { ...prev, [templateId]: { ...cur, locales } };
        });
        break;
      }
      default:
        break;
    }
  };

  function runExportStateFlow(
    phase2: AppState['exportState'],
    delayMs: number,
    idleAfterMs: number
  ) {
    setTimeout(() => {
      setExportState(phase2);
      setTimeout(() => setExportState('idle'), idleAfterMs);
    }, delayMs);
  }

  function handleImportTranslationsStandalone(json: string) {
    if (!selectedTemplateId || !isCustomTemplateId(selectedTemplateId)) return;
    try {
      const data = JSON.parse(json) as {
        sourceLocale?: string;
        fields?: { greeting?: string; body?: string; footer?: string; cta?: string; legalText?: string };
      };
      const loc = (data.sourceLocale as Locale) || locale;
      const f = data.fields;
      if (!f) return;
      const content: EmailContent = {
        greeting: f.greeting ?? '',
        body: f.body ?? '',
        footer: f.footer ?? '',
        cta: f.cta ?? 'Make a payment',
        legalText: f.legalText ?? '',
      };
      setCustomTemplatesContent((prev) => {
        const cur = prev[selectedTemplateId];
        if (!cur) return prev;
        const base = cur.locales[cur.baseLocale] ?? cur.locales[loc];
        const locales = { ...cur.locales };
        locales[loc] = {
          tone: base?.tone ?? 'Neutral',
          variants: { A: { ...content }, B: { ...content }, C: { ...content } },
          status: 'custom',
        };
        return { ...prev, [selectedTemplateId]: { ...cur, locales } };
      });
    } catch (_) {
    }
  }

  return (
    <AppView
      state={state}
      dispatch={dispatch}
      getSystemEmailContent={(params) =>
        getSystemEmailContentI18n(params.templateId, params.locale, params.tone, params.variant)
      }
      syncLocaleToI18n={(l) => i18n.changeLanguage(l)}
      onImportTranslations={handleImportTranslationsStandalone}
      isWebApp={true}
      previewOverrideVersion={previewOverrideVersion}
      onPreviewOverrideApplied={() => setPreviewOverrideVersion((v) => v + 1)}
    />
  );
}
