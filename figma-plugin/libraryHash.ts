/**
 * Stable hash of the library subset (templateCatalog + customTemplatesContent)
 * for comparing local state vs file snapshot. Not cryptographic.
 */

import type { TemplateInfo, CustomTemplateContent } from './messageTypes';

function sortKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortKeys);
  const o = obj as Record<string, unknown>;
  const keys = Object.keys(o).sort();
  const out: Record<string, unknown> = {};
  for (const k of keys) out[k] = sortKeys(o[k]);
  return out;
}

/** djb2 string hash (non-crypto, for comparison only). */
function hashString(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export function computeLibraryHash(
  templates: TemplateInfo[],
  customTemplatesContent: Record<string, CustomTemplateContent>
): string {
  const canonical = sortKeys({ templates, customTemplatesContent });
  const json = JSON.stringify(canonical);
  return hashString(json);
}
