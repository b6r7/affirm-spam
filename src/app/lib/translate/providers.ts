/** Translation provider: LibreTranslate or MyMemory. Optional; offline returns error. */
import { replacePlaceholdersWithSentinels, restorePlaceholders } from './placeholders';
import { getCachedTranslation, setCachedTranslation } from './cache';

export const DEFAULT_TRANSLATION_ENDPOINT = 'https://translate.argosopentech.com';

const LOCALE_TO_LIBRE: Record<string, string> = {
  'en-US': 'en',
  'en-GB': 'en',
  'es-ES': 'es',
  'es-MX': 'es',
  'pl-PL': 'pl',
  'fr-FR': 'fr',
};

function toLibreLang(locale: string): string {
  return LOCALE_TO_LIBRE[locale] ?? locale.split('-')[0] ?? 'en';
}

export type TranslateResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

/** Translate text; uses cache, then LibreTranslate, then MyMemory. Preserves placeholders. */
export async function translate(
  text: string,
  fromLocale: string,
  toLocale: string,
  baseUrl: string = DEFAULT_TRANSLATION_ENDPOINT
): Promise<TranslateResult> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, text: '' };

  const from = toLibreLang(fromLocale);
  const to = toLibreLang(toLocale);
  if (from === to) return { ok: true, text: trimmed };

  const cached = getCachedTranslation(fromLocale, toLocale, trimmed);
  if (cached != null) return { ok: true, text: cached };

  const { text: toSend, placeholders } = replacePlaceholdersWithSentinels(trimmed);

  let translated: string | null = null;
  let lastError = '';

  if (baseUrl) {
    const result = await tryLibreTranslate(toSend, from, to, baseUrl.trim().replace(/\/$/, ''));
    if (result.ok) translated = result.text;
    else lastError = result.error;
  }

  if (translated == null) {
    const result = await tryMyMemory(toSend, from, to);
    if (result.ok) translated = result.text;
    else lastError = result.error;
  }

  if (translated != null) {
    const withPlaceholders = placeholders.length > 0 ? restorePlaceholders(translated, placeholders) : translated;
    setCachedTranslation(fromLocale, toLocale, trimmed, withPlaceholders);
    return { ok: true, text: withPlaceholders };
  }

  return { ok: false, error: lastError || 'Translation failed' };
}

async function tryLibreTranslate(
  text: string,
  source: string,
  target: string,
  baseUrl: string
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${baseUrl}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target }),
    });
    if (!res.ok) return { ok: false, error: `Server ${res.status}` };
    const data = await res.json();
    const t = data?.translatedText;
    if (typeof t !== 'string') return { ok: false, error: 'Invalid response' };
    return { ok: true, text: t };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Network error';
    return { ok: false, error: msg };
  }
}

async function tryMyMemory(text: string, source: string, target: string): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  try {
    const langpair = `${source}|${target}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;
    const res = await fetch(url);
    if (!res.ok) return { ok: false, error: `Server ${res.status}` };
    const data = await res.json();
    const t = data?.responseData?.translatedText;
    if (typeof t !== 'string') return { ok: false, error: 'Invalid response' };
    return { ok: true, text: t };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Network error';
    return { ok: false, error: msg };
  }
}

const STORAGE_KEY_ENDPOINT = 'affirm-spam:translation-endpoint';

export function getStoredEndpointUrl(): string {
  try {
    const v = localStorage.getItem(STORAGE_KEY_ENDPOINT);
    return (v && v.trim()) || DEFAULT_TRANSLATION_ENDPOINT;
  } catch {
    return DEFAULT_TRANSLATION_ENDPOINT;
  }
}

export function setStoredEndpointUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ENDPOINT, url.trim() || DEFAULT_TRANSLATION_ENDPOINT);
  } catch {}
}
