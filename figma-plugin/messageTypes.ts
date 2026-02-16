/**
 * Shared message protocol and AppState (main thread is source of truth).
 * UI <-> MAIN over postMessage / figma.ui.postMessage.
 */

// ─── Type definitions (serializable; no React/dom) ────────────────────────

export type Locale =
  | 'en-US'
  | 'en-GB'
  | 'es-ES'
  | 'es-MX'
  | 'pl-PL'
  | 'fr-FR';

export type Tone =
  | 'Supportive'
  | 'Neutral'
  | 'Firm'
  | 'Educational';

export type Variant = 'A' | 'B' | 'C';

/** Single source for "Recommended" variant (badge, toggle tint, auto-select after generate). */
export const RECOMMENDED_VARIANT: Variant = 'B';

export type LayoutMode = 'affirm' | 'spi';

export type PreviewDevice = 'mobile' | 'desktop';

export type TemplateType = string;

export interface TemplateInfo {
  id: TemplateType;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  intent: string;
}

export interface EmailContent {
  /** Per-locale bold title (e.g. from email.title in import). Falls back to template name when absent. */
  title?: string;
  greeting: string;
  body: string;
  warning?: string;
  cta: string;
  footer: string;
  legalText: string;
}

export interface DraftPayload {
  name: string;
  locale: Locale;
  text: string;
}

export type LocaleContentStatus = 'auto' | 'custom';

export interface CustomTemplateLocaleContent {
  tone: Tone;
  variants: Record<Variant, EmailContent>;
  status: LocaleContentStatus;
}

export interface CustomTemplateContent {
  baseLocale: Locale;
  locales: Record<Locale, CustomTemplateLocaleContent>;
}

/** Resolved compliance issue indices per locale (serializable). */
export type ResolvedComplianceState = Record<Locale, number[]>;

export type ExportState =
  | 'idle'
  | 'exporting-selected'
  | 'exporting-all'
  | 'exported-selected'
  | 'exported-all';

export type PrototypeState = 'normal' | 'draft-unsaved' | 'saved-new-template';

export interface AppStateUI {
  isLocaleSelectorDisabled: boolean;
  localeLockReason?: string;
}

export interface AppStateTemplates {
  selectedTemplateLocale?: Locale;
}

/** Cached result of "Generate variants" (main thread is source of truth). Preview === insertion. */
export interface GeneratedState {
  templateId: TemplateType;
  templateName: string;
  locale: Locale;
  tone: Tone;
  variants: Record<Variant, EmailContent>;
  generatedAt: number;
  /** `${templateId}|${locale}|${tone}` — used to detect stale when selection changes. */
  signature: string;
}

/** Metadata shown in UI after Sync to file / Pull from file. */
export interface SyncMeta {
  lastSyncedAt: string;
  lastSyncedBy?: string;
  /** Hash of library in file (for stale indicator). Set when we Sync or Pull. */
  lastFileHash?: string;
}

/** Derived in main thread for UI; not persisted. */
export interface LibraryStatus {
  localHash: string;
  fileHash?: string;
  lastSyncedAt?: string;
  lastSyncedBy?: string;
}

/** Persisted plugin settings. */
export interface AppStateSettings {
  autoSyncToFile?: boolean;
}

/** Snapshot stored in figma.root shared plugin data (namespace "affirm_spam", key "library_v1"). */
export interface LibrarySnapshotV1 {
  version: 1;
  updatedAt: string;
  updatedBy?: string;
  templates: TemplateInfo[];
  customTemplatesContent: Record<string, CustomTemplateContent>;
}

/** Single source of truth held by main thread. */
export interface AppState {
  locale: Locale;
  tone: Tone;
  layoutMode: LayoutMode;
  previewDevice: PreviewDevice;
  selectedVariants: Variant[];
  selectedTemplateId: TemplateType;
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
  exportState: ExportState;
  isGenerating: boolean;
  /** Cached A/B/C variants from last "Generate variants"; null until generated. */
  generated?: GeneratedState | null;
  /** Timestamp of last successful export (for "Last exported" label). */
  lastExportedAt?: number | null;
  ui: AppStateUI;
  templates: AppStateTemplates;
  /** Set after Sync to file or Pull from file; shown in Sync UI. */
  syncMeta?: SyncMeta;
  settings?: AppStateSettings;
  /** Set by main thread in sendState(); used for Library status line. Not persisted. */
  libraryStatus?: LibraryStatus;
}

// ─── Messages UI -> MAIN ───────────────────────────────────────────────────

export type MessageFromUI =
  | { type: 'INIT' }
  | { type: 'SET_LOCALE'; locale: Locale }
  | { type: 'SET_TONE'; tone: Tone }
  | { type: 'TOGGLE_VARIANT'; variant: Variant }
  | { type: 'SELECT_TEMPLATE'; templateId: TemplateType }
  | { type: 'START_ADD_TEMPLATE' }
  | { type: 'UPDATE_DRAFT'; payload: DraftPayload }
  | { type: 'SAVE_DRAFT'; payload: DraftPayload }
  | { type: 'CANCEL_DRAFT' }
  | { type: 'RESOLVE_COMPLIANCE_ISSUE'; locale: Locale; issueIndex: number }
  | { type: 'EXPORT_SELECTED' }
  | { type: 'EXPORT_ALL' }
  | { type: 'GENERATE_VARIANTS' }
  | { type: 'INSERT_TO_CANVAS' }
  | { type: 'SET_LAYOUT_MODE'; layoutMode: LayoutMode }
  | { type: 'SET_PREVIEW_DEVICE'; previewDevice: PreviewDevice }
  | { type: 'TOGGLE_BASE_TEMPLATE' }
  | { type: 'DUPLICATE_TEMPLATE' }
  | { type: 'RENAME_TEMPLATE'; name: string }
  | { type: 'DELETE_TEMPLATE' }
  | { type: 'MARK_DEPRECATED' }
  | { type: 'RESET_STORAGE' }
  | { type: 'CREATE_TRANSLATION'; templateId: string; targetLocale: Locale }
  | { type: 'SELECT_TEMPLATE_LOCALE'; templateId: string; locale: Locale }
  | { type: 'IMPORT_TRANSLATIONS'; templateId: string; json: string }
  | { type: 'SHOW_TOAST'; message: string }
  | { type: 'SYNC_TO_FILE' }
  | { type: 'PULL_FROM_FILE' }
  | { type: 'SYNC_OVERWRITE_CONFIRMED' }
  | { type: 'SET_AUTO_SYNC'; enabled: boolean }
  | { type: 'DOWNLOAD_LIBRARY_JSON'; format?: 'single' | 'per_locale'; locales?: Locale[] }
  | { type: 'COPY_VARIABLE_NAMES_DEBUG' };

export interface InsertToCanvasPayload {
  templateName: string;
  locale: Locale;
  tone: Tone;
  layoutMode: LayoutMode;
  previewDevice: PreviewDevice;
  variants: Record<Variant, EmailContent>;
}

// ─── Messages MAIN -> UI ───────────────────────────────────────────────────

export type MessageFromMain =
  | { type: 'STATE'; state: AppState }
  | { type: 'ERROR'; message: string }
  | { type: 'TOAST'; message: string }
  | { type: 'SYNC_CONFLICT'; remoteUpdatedAt: string; remoteUpdatedBy?: string }
  | { type: 'LIBRARY_JSON_FOR_DOWNLOAD'; json: string }
  | { type: 'LIBRARY_JSON_FOR_DOWNLOAD_MULTI'; files: Array<{ locale: Locale; json: string }> }
  | { type: 'VARIABLE_NAMES_DUMP'; lines: string[] };

// ─── Guards ────────────────────────────────────────────────────────────────

export function isMessageFromUI(msg: unknown): msg is MessageFromUI {
  return typeof msg === 'object' && msg !== null && 'type' in msg;
}

export function isMessageFromMain(msg: unknown): msg is MessageFromMain {
  return typeof msg === 'object' && msg !== null && 'type' in msg;
}

export function isStateMessage(msg: unknown): msg is Extract<MessageFromMain, { type: 'STATE' }> {
  return isMessageFromMain(msg) && msg.type === 'STATE';
}
