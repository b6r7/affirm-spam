/** True when running inside Figma plugin (main or UI). */
export const isFigmaPlugin =
  typeof globalThis !== 'undefined' &&
  'figma' in globalThis;
