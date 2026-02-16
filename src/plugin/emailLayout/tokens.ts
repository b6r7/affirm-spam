/**
 * Affirm DS tokens for email insertion. Single source for colors, radii, spacing, typography.
 * Use these in the Figma insertion renderer only; never hardcode hex/rgb inline.
 */

/** RGB in 0–1 range for Figma fills/strokes */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

// ─── Colors ─────────────────────────────────────────────────────────────────
/** CTA / primary button — Affirm DS blue (never green) */
export const CTA_FILL: RGB = { r: 74 / 255, g: 74 / 255, b: 244 / 255 };
export const CTA_LABEL_FILL: RGB = { r: 1, g: 1, b: 1 };

/** Header bar (Affirm default) */
export const HEADER_FILL: RGB = { r: 0, g: 0, b: 0 };

/** Legal / secondary text */
export const LEGAL_FILL: RGB = { r: 0.45, g: 0.45, b: 0.45 };

/** Hero placeholder background */
export const HERO_FILL: RGB = { r: 0.96, g: 0.96, b: 0.96 };

/** Card borders / divider */
export const STROKE_DEFAULT: RGB = { r: 0.88, g: 0.88, b: 0.88 };
export const STROKE_LIGHT: RGB = { r: 0.9, g: 0.9, b: 0.9 };

/** Card background (Affirm default) */
export const CARD_FILL_AFFIRM: RGB = { r: 0.98, g: 0.98, b: 0.98 };
/** Card background (SPI) */
export const CARD_FILL_SPI: RGB = { r: 1, g: 1, b: 1 };

/** Parent frame / canvas */
export const PARENT_FILL: RGB = { r: 1, g: 1, b: 1 };
export const PARENT_STROKE: RGB = { r: 0.9, g: 0.9, b: 0.9 };

// ─── Radii ─────────────────────────────────────────────────────────────────
export const RADIUS_CARD_AFFIRM = 12;
export const RADIUS_CARD_SPI = 16;
export const RADIUS_CTA_AFFIRM = 8;
export const RADIUS_CTA_SPI = 12;

// ─── Email-safe max-width guides (preview overlay only; do not affect layout) ─
export const EMAIL_SAFE_WIDTH_MOBILE = 360;
export const EMAIL_SAFE_WIDTH_DESKTOP = 600;

// ─── Spacing ────────────────────────────────────────────────────────────────
export const SPACING_FRAME_GAP = 24;
export const SPACING_PLACEMENT_OFFSET = 80;
export const SPACING_SECTION_GAP = 16;
export const SPACING_ATTRIBUTION_LINE_GAP = 8;
export const SPACING_OUTER_PADDING = 24;
export const DIVIDER_HEIGHT = 1;
export const STROKE_WEIGHT = 1;

// ─── Typography (px) ───────────────────────────────────────────────────────
export const TYPO_HEADING_SIZE_AFFIRM = 20;
export const TYPO_HEADING_LINE_AFFIRM = 28;
export const TYPO_BODY_SIZE_AFFIRM = 15;
export const TYPO_BODY_LINE_AFFIRM = 22;
export const TYPO_LEGAL_SIZE = 12;
export const TYPO_LEGAL_LINE_AFFIRM = 18;
export const TYPO_CTA_SIZE_AFFIRM = 14;
export const TYPO_HEADING_SIZE_SPI = 22;
export const TYPO_HEADING_LINE_SPI = 30;
export const TYPO_BODY_SIZE_SPI = 16;
export const TYPO_BODY_LINE_SPI = 24;
export const TYPO_LEGAL_LINE_SPI = 18;
export const TYPO_CTA_SIZE_SPI = 15;
