/** Translation cache in localStorage. Key: translate:{from}:{to}:{hash(text)} */
const CACHE_PREFIX = 'translate:';
const MAX_CACHE_ENTRIES = 500;

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = ((h << 5) - h) + c;
    h = h & h;
  }
  return Math.abs(h).toString(36);
}

function cacheKey(from: string, to: string, text: string): string {
  return `${CACHE_PREFIX}${from}:${to}:${simpleHash(text)}`;
}

export function getCachedTranslation(from: string, to: string, text: string): string | null {
  try {
    const key = cacheKey(from, to, text);
    const raw = localStorage.getItem(key);
    if (raw == null) return null;
    return raw;
  } catch {
    return null;
  }
}

export function setCachedTranslation(from: string, to: string, text: string, result: string): void {
  try {
    const key = cacheKey(from, to, text);
    localStorage.setItem(key, result);
    pruneCacheIfNeeded();
  } catch {}
}

function pruneCacheIfNeeded(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX)) keys.push(k);
    }
    if (keys.length <= MAX_CACHE_ENTRIES) return;
    keys.sort();
    const toRemove = keys.slice(0, keys.length - MAX_CACHE_ENTRIES);
    toRemove.forEach(k => localStorage.removeItem(k));
  } catch {}
}
