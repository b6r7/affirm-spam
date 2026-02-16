/**
 * Preview inline-edit overrides: keyed by templateId + locale + variantId + layoutMode + tone.
 * Stored in localStorage so switching locale/variant does not lose edits.
 */

import type { Locale } from '../data/contentData';
import type { LayoutMode, Variant } from 'figma-plugin/messageTypes';

export type EditableSlot = 'title' | 'greeting' | 'body' | 'footer' | 'cta' | 'legalText' | 'warning';

export interface PreviewOverrideKey {
  templateId: string;
  locale: Locale;
  variantId: Variant;
  layoutMode: LayoutMode;
  tone: string;
}

const STORAGE_PREFIX = 'affirm_spam_preview_override_';

function storageKey(k: PreviewOverrideKey): string {
  return `${STORAGE_PREFIX}${k.templateId}|${k.locale}|${k.variantId}|${k.layoutMode}|${k.tone}`;
}

export type OverridesMap = Partial<Record<EditableSlot, string>>;

export function getPreviewOverrides(key: PreviewOverrideKey): OverridesMap {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as OverridesMap;
    }
  } catch {
    // ignore
  }
  return {};
}

export function setPreviewOverride(
  key: PreviewOverrideKey,
  slot: EditableSlot,
  value: string
): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const current = getPreviewOverrides(key);
    const next = { ...current, [slot]: value };
    localStorage.setItem(storageKey(key), JSON.stringify(next));
  } catch {
    // ignore
  }
}

/** Merge base content with overrides (overrides take precedence). */
export function applyOverridesToContent(
  base: { title?: string; greeting: string; body: string; footer: string; cta: string; legalText: string; warning?: string },
  overrides: OverridesMap
): typeof base {
  const out = { ...base };
  if (overrides.title !== undefined) out.title = overrides.title;
  if (overrides.greeting !== undefined) out.greeting = overrides.greeting;
  if (overrides.body !== undefined) out.body = overrides.body;
  if (overrides.footer !== undefined) out.footer = overrides.footer;
  if (overrides.cta !== undefined) out.cta = overrides.cta;
  if (overrides.legalText !== undefined) out.legalText = overrides.legalText;
  if (overrides.warning !== undefined) out.warning = overrides.warning;
  return out;
}

export function getAllOverrideKeys(): PreviewOverrideKey[] {
  if (typeof localStorage === 'undefined') return [];
  const keys: PreviewOverrideKey[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(STORAGE_PREFIX)) continue;
    const part = k.slice(STORAGE_PREFIX.length);
    const parts = part.split('|');
    if (parts.length >= 5) {
      keys.push({
        templateId: parts[0],
        locale: parts[1] as Locale,
        variantId: parts[2] as Variant,
        layoutMode: parts[3] as LayoutMode,
        tone: parts[4],
      });
    }
  }
  return keys;
}
