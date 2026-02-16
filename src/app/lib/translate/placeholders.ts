/** Preserve placeholders during translation via sentinel tokens. */
const SENTINEL_PREFIX = '__PLH_';
const SENTINEL_SUFFIX = '__';

const PLACEHOLDER_REGEX = /\[[^\]]+\]|\{\{[^}]+\}\}|\{[^}]+\}/g;

export interface PlaceholderResult {
  text: string;
  placeholders: string[];
}

/** Replace placeholders with sentinel tokens; returns text and placeholder list. */
export function replacePlaceholdersWithSentinels(text: string): PlaceholderResult {
  const placeholders: string[] = [];
  const textWithout = text.replace(PLACEHOLDER_REGEX, (match) => {
    const index = placeholders.length;
    placeholders.push(match);
    return `${SENTINEL_PREFIX}${index}${SENTINEL_SUFFIX}`;
  });
  return { text: textWithout, placeholders };
}

/** Restore placeholders in translated text. */
export function restorePlaceholders(text: string, placeholders: string[]): string {
  let result = text;
  placeholders.forEach((ph, index) => {
    const sentinel = `${SENTINEL_PREFIX}${index}${SENTINEL_SUFFIX}`;
    result = result.replace(new RegExp(escapeRegex(sentinel), 'g'), ph);
  });
  return result;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
