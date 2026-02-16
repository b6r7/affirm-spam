/**
 * Persistent storage v1 using figma.clientStorage.
 * Versioned schema; safe migrations; ephemeral flags (isGenerating, exportState) not stored.
 */

import type {
  AppState,
  AppStateTemplates,
  AppStateUI,
  GeneratedState,
  Locale,
  LayoutMode,
  PreviewDevice,
  TemplateInfo,
  CustomTemplateContent,
  CustomTemplateLocaleContent,
  ResolvedComplianceState,
  PrototypeState,
  TemplateType,
  SyncMeta,
  AppStateSettings,
} from './messageTypes';
import { DEFAULT_APP_STATE } from './data/systemTemplates';

export const STORAGE_KEY = 'affirm_spam_state_v1';
export const schemaVersion = 1;

const LOCALE_LOCK_REASON = 'Locale is locked for custom templates. Create a translation to add another locale.';

export function isCustomTemplateId(templateId: TemplateType): boolean {
  return templateId != null && String(templateId).startsWith('custom-');
}

/** Draft mode (draft-unsaved) keeps locale dropdown enabled; saved custom template locks it. */
export function computeUi(selectedTemplateId: TemplateType, prototypeState?: PrototypeState): AppStateUI {
  const isDraftMode = prototypeState === 'draft-unsaved';
  if (isDraftMode) {
    return { isLocaleSelectorDisabled: false };
  }
  const isCustom = isCustomTemplateId(selectedTemplateId);
  return {
    isLocaleSelectorDisabled: isCustom,
    localeLockReason: isCustom ? LOCALE_LOCK_REASON : undefined,
  };
}

/** Persisted shape: AppState minus ephemeral UI flags (isGenerating, exportState). */
export interface PersistedState {
  schemaVersion: number;
  locale: Locale;
  tone: AppState['tone'];
  layoutMode: LayoutMode;
  previewDevice: PreviewDevice;
  selectedVariants: AppState['selectedVariants'];
  selectedTemplateId: AppState['selectedTemplateId'];
  isBaseTemplate: boolean;
  isDeprecated: boolean;
  prototypeState: PrototypeState;
  draftName: string;
  draftLocale: Locale;
  draftText: string;
  isDraftDirty: boolean;
  templateCatalog: TemplateInfo[];
  customTemplatesContent: Record<string, CustomTemplateContent>;
  resolvedComplianceIssues: ResolvedComplianceState;
  templates?: AppStateTemplates;
  /** Cached generated variants (optional; cleared on schema change). */
  generated?: GeneratedState | null;
  syncMeta?: SyncMeta;
  settings?: AppStateSettings;
}

const LOCALES: Locale[] = ['en-US', 'en-GB', 'es-ES', 'es-MX', 'pl-PL', 'fr-FR'];

/** Normalize legacy (locale/variants/byLocale) or new (baseLocale/locales) shape to CustomTemplateContent. */
function normalizeCustomTemplateContent(raw: unknown): CustomTemplateContent | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.baseLocale != null && o.locales != null && typeof o.locales === 'object' && !Array.isArray(o.locales)) {
    const baseLocale = o.baseLocale as Locale;
    const locales = o.locales as Record<string, CustomTemplateLocaleContent>;
    if (!LOCALES.includes(baseLocale)) return null;
    return { baseLocale, locales };
  }
  const legacyLocale = o.locale as Locale | undefined;
  const legacyTone = o.tone as CustomTemplateLocaleContent['tone'] | undefined;
  const legacyVariants = o.variants as Record<string, unknown> | undefined;
  const byLocale = o.byLocale as Record<string, { variants: Record<string, unknown> }> | undefined;
  if (legacyLocale == null || !LOCALES.includes(legacyLocale) || !legacyVariants || typeof legacyVariants !== 'object') return null;
  const baseTone = legacyTone != null ? legacyTone : 'Neutral';
  const base: CustomTemplateLocaleContent = {
    tone: baseTone,
    variants: legacyVariants as CustomTemplateLocaleContent['variants'],
    status: 'custom',
  };
  const locales: Record<Locale, CustomTemplateLocaleContent> = { [legacyLocale]: base };
  if (byLocale && typeof byLocale === 'object') {
    for (const loc of Object.keys(byLocale)) {
      if (!LOCALES.includes(loc as Locale)) continue;
      const entry = byLocale[loc];
      if (entry && entry.variants && typeof entry.variants === 'object') {
        locales[loc as Locale] = { tone: baseTone, variants: entry.variants as CustomTemplateLocaleContent['variants'], status: 'custom' };
      }
    }
  }
  return { baseLocale: legacyLocale, locales };
}

function migrateCustomTemplatesContent(raw: unknown): Record<string, CustomTemplateContent> {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, CustomTemplateContent> = {};
  for (const [id, val] of Object.entries(raw)) {
    const normalized = normalizeCustomTemplateContent(val);
    if (normalized) out[id] = normalized;
  }
  return out;
}

function emptyResolved(): ResolvedComplianceState {
  const o: Record<string, number[]> = {};
  LOCALES.forEach((l) => (o[l] = []));
  return o as ResolvedComplianceState;
}

/** Seed defaults: system templates catalog, empty custom content, empty resolved issues. */
function getDefaultPersisted(): PersistedState {
  return {
    schemaVersion,
    locale: DEFAULT_APP_STATE.locale,
    tone: DEFAULT_APP_STATE.tone,
    layoutMode: DEFAULT_APP_STATE.layoutMode,
    previewDevice: DEFAULT_APP_STATE.previewDevice,
    selectedVariants: [...DEFAULT_APP_STATE.selectedVariants],
    selectedTemplateId: DEFAULT_APP_STATE.selectedTemplateId,
    isBaseTemplate: DEFAULT_APP_STATE.isBaseTemplate,
    isDeprecated: DEFAULT_APP_STATE.isDeprecated,
    prototypeState: DEFAULT_APP_STATE.prototypeState,
    draftName: DEFAULT_APP_STATE.draftName,
    draftLocale: DEFAULT_APP_STATE.draftLocale,
    draftText: DEFAULT_APP_STATE.draftText,
    isDraftDirty: DEFAULT_APP_STATE.isDraftDirty,
    templateCatalog: DEFAULT_APP_STATE.templateCatalog,
    customTemplatesContent: {},
    resolvedComplianceIssues: emptyResolved(),
    templates: {},
    generated: undefined,
    syncMeta: undefined,
    settings: { autoSyncToFile: false },
  };
}

/** Full AppState for seed/defaults (includes ephemeral flags). */
export function getDefaultState(): AppState {
  const p = getDefaultPersisted();
  return {
    ...p,
    exportState: 'idle',
    isGenerating: false,
    generated: p.generated ?? undefined,
    ui: computeUi(p.selectedTemplateId, p.prototypeState),
    templates: p.templates != null ? p.templates : {},
  };
}

/** Handle missing or invalid keys safely; returns valid PersistedState. */
export function migrate(old: unknown): PersistedState {
  const def = getDefaultPersisted();
  if (old == null || typeof old !== 'object') {
    return def;
  }
  const o = old as Record<string, unknown>;
  if (o.schemaVersion !== schemaVersion) {
    return def;
  }

  const rawGen = o.generated;
  const generated =
    rawGen != null && typeof rawGen === 'object' &&
    typeof (rawGen as GeneratedState).templateId === 'string' &&
    typeof (rawGen as GeneratedState).signature === 'string' &&
    typeof (rawGen as GeneratedState).generatedAt === 'number'
      ? (rawGen as GeneratedState)
      : def.generated;

  return {
    schemaVersion,
    locale: typeof o.locale === 'string' && LOCALES.includes(o.locale as Locale) ? (o.locale as Locale) : def.locale,
    tone: typeof o.tone === 'string' && ['Supportive', 'Neutral', 'Firm', 'Educational'].includes(o.tone) ? o.tone as AppState['tone'] : def.tone,
    layoutMode: typeof o.layoutMode === 'string' && (o.layoutMode === 'affirm' || o.layoutMode === 'spi') ? (o.layoutMode as LayoutMode) : def.layoutMode,
    previewDevice: typeof o.previewDevice === 'string' && (o.previewDevice === 'mobile' || o.previewDevice === 'desktop') ? (o.previewDevice as PreviewDevice) : def.previewDevice,
    selectedVariants: Array.isArray(o.selectedVariants) ? (o.selectedVariants as AppState['selectedVariants']) : def.selectedVariants,
    selectedTemplateId:
      Array.isArray(o.templateCatalog) && o.templateCatalog.length === 0
        ? ''
        : typeof o.selectedTemplateId === 'string'
          ? o.selectedTemplateId
          : def.selectedTemplateId,
    isBaseTemplate: typeof o.isBaseTemplate === 'boolean' ? o.isBaseTemplate : def.isBaseTemplate,
    isDeprecated: typeof o.isDeprecated === 'boolean' ? o.isDeprecated : def.isDeprecated,
    prototypeState: typeof o.prototypeState === 'string' && ['normal', 'draft-unsaved', 'saved-new-template'].includes(o.prototypeState) ? (o.prototypeState as PrototypeState) : def.prototypeState,
    draftName: typeof o.draftName === 'string' ? o.draftName : def.draftName,
    draftLocale: typeof o.draftLocale === 'string' && LOCALES.includes(o.draftLocale as Locale) ? (o.draftLocale as Locale) : def.draftLocale,
    draftText: typeof o.draftText === 'string' ? o.draftText : def.draftText,
    isDraftDirty: typeof o.isDraftDirty === 'boolean' ? o.isDraftDirty : def.isDraftDirty,
    templateCatalog: Array.isArray(o.templateCatalog) ? (o.templateCatalog as TemplateInfo[]) : def.templateCatalog,
    customTemplatesContent: migrateCustomTemplatesContent(o.customTemplatesContent),
    resolvedComplianceIssues: o.resolvedComplianceIssues != null && typeof o.resolvedComplianceIssues === 'object' && !Array.isArray(o.resolvedComplianceIssues) ? (o.resolvedComplianceIssues as ResolvedComplianceState) : def.resolvedComplianceIssues,
    templates: o.templates != null && typeof o.templates === 'object' && !Array.isArray(o.templates) ? (o.templates as AppStateTemplates) : def.templates,
    generated,
    syncMeta:
      o.syncMeta != null && typeof o.syncMeta === 'object' && typeof (o.syncMeta as SyncMeta).lastSyncedAt === 'string'
        ? (o.syncMeta as SyncMeta)
        : def.syncMeta,
  };
}

/** Load state from storage; returns full AppState (seed defaults if missing/invalid). */
export async function loadState(): Promise<AppState> {
  try {
    const raw = await figma.clientStorage.getAsync(STORAGE_KEY);
    if (raw === undefined) {
      return getDefaultState();
    }
    const persisted = migrate(raw);
    return {
      ...persisted,
      exportState: 'idle',
      isGenerating: false,
      generated: persisted.generated ?? undefined,
      ui: computeUi(persisted.selectedTemplateId, persisted.prototypeState),
      templates: persisted.templates != null ? persisted.templates : {},
      syncMeta: persisted.syncMeta,
      settings: persisted.settings,
    };
  } catch {
    return getDefaultState();
  }
}

/** Persist state (omits isGenerating and exportState). */
export async function saveState(state: AppState): Promise<void> {
  try {
    const persisted: PersistedState = {
      schemaVersion,
      locale: state.locale,
      tone: state.tone,
      layoutMode: state.layoutMode,
      previewDevice: state.previewDevice,
      selectedVariants: state.selectedVariants,
      selectedTemplateId: state.selectedTemplateId,
      isBaseTemplate: state.isBaseTemplate,
      isDeprecated: state.isDeprecated,
      prototypeState: state.prototypeState,
      draftName: state.draftName,
      draftLocale: state.draftLocale,
      draftText: state.draftText,
      isDraftDirty: state.isDraftDirty,
      templateCatalog: state.templateCatalog,
      customTemplatesContent: state.customTemplatesContent,
      resolvedComplianceIssues: state.resolvedComplianceIssues,
      templates: state.templates,
      generated: state.generated ?? undefined,
      syncMeta: state.syncMeta,
      settings: state.settings,
    };
    await figma.clientStorage.setAsync(STORAGE_KEY, persisted);
  } catch {
    // ignore
  }
}
