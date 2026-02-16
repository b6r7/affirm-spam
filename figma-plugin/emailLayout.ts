/**
 * Shared email layout spec: single source of truth for preview (UI) and Figma insert.
 * Affirm default = transactional; SPI = campaign/editorial.
 */

import type { PreviewDevice } from './messageTypes';

export type LayoutMode = 'affirm' | 'spi';

/** Affirm DS primary blue (CTA, primary button). Used by preview and canvas insert. */
export const AFFIRM_BLUE_PRIMARY_HEX = '#4A4AF4';
/** RGB 0–1 for Figma fills */
export const AFFIRM_BLUE_PRIMARY_RGB = { r: 74 / 255, g: 74 / 255, b: 244 / 255 };

/** Affirm default: black header bar height (same for mobile + desktop). */
export const HEADER_HEIGHT_AFFIRM = 89;

/** @deprecated Use HEADER_HEIGHT_AFFIRM for Affirm layout. Kept for compatibility. */
export function getHeaderHeight(_device: PreviewDevice): number {
  return HEADER_HEIGHT_AFFIRM;
}

/** Shared layout model: padding and gaps for preview + insert parity. */
export const LAYOUT_OUTER_PADDING = 24;
export const LAYOUT_SECTION_GAP = 16;
export const LAYOUT_TEXT_LINE_GAP = 8;
export const LAYOUT_CTA_MARGIN_TOP = 16;
export const LAYOUT_LEGAL_MARGIN_TOP = 12;

export interface EmailLayoutSpec {
  /** Card/container */
  cardWidthDesktop: number;
  cardWidthMobile: number;
  padding: number;
  itemSpacing: number;
  cornerRadius: number;
  /** Affirm default header bar height; SPI has no bar */
  headerHeightAffirm: number;
  fill: { r: number; g: number; b: number };
  stroke: { r: number; g: number; b: number };
  /** Typography */
  headingFontSize: number;
  headingLineHeight: number;
  headingFontWeight: 'normal' | 'semibold';
  bodyFontSize: number;
  bodyLineHeight: number;
  legalFontSize: number;
  legalLineHeight: number;
  ctaFontSize: number;
  ctaFontWeight: 'normal' | 'semibold';
  /** CTA block */
  ctaHeight: number;
  ctaCornerRadius: number;
  /** SPI-only */
  heroHeight: number;
  sectionSpacingExtra: number;
}

const FONT_FAMILY = 'Inter';

/** Affirm default: transactional, tighter spacing */
const AFFIRM_SPEC: EmailLayoutSpec = {
  cardWidthDesktop: 420,
  cardWidthMobile: 360,
  padding: LAYOUT_OUTER_PADDING,
  itemSpacing: LAYOUT_SECTION_GAP,
  cornerRadius: 12,
  headerHeightAffirm: HEADER_HEIGHT_AFFIRM,
  fill: { r: 0.98, g: 0.98, b: 0.98 },
  stroke: { r: 0.88, g: 0.88, b: 0.88 },
  headingFontSize: 20,
  headingLineHeight: 28,
  headingFontWeight: 'semibold',
  bodyFontSize: 15,
  bodyLineHeight: 22,
  legalFontSize: 12,
  legalLineHeight: 18,
  ctaFontSize: 14,
  ctaFontWeight: 'semibold',
  ctaHeight: 40,
  ctaCornerRadius: 8,
  heroHeight: 0,
  sectionSpacingExtra: 0,
};

/** SPI: editorial/campaign, hero block, more spacing; no header bar */
const SPI_SPEC: EmailLayoutSpec = {
  cardWidthDesktop: 420,
  cardWidthMobile: 360,
  padding: LAYOUT_OUTER_PADDING,
  itemSpacing: LAYOUT_SECTION_GAP,
  cornerRadius: 16,
  headerHeightAffirm: 0,
  fill: { r: 1, g: 1, b: 1 },
  stroke: { r: 0.9, g: 0.9, b: 0.9 },
  headingFontSize: 22,
  headingLineHeight: 30,
  headingFontWeight: 'semibold',
  bodyFontSize: 16,
  bodyLineHeight: 24,
  legalFontSize: 12,
  legalLineHeight: 18,
  ctaFontSize: 15,
  ctaFontWeight: 'semibold',
  ctaHeight: 44,
  ctaCornerRadius: 12,
  heroHeight: 180,
  sectionSpacingExtra: 6,
};

export function getEmailLayoutSpec(mode: LayoutMode): EmailLayoutSpec {
  return mode === 'spi' ? { ...SPI_SPEC } : { ...AFFIRM_SPEC };
}

export const EMAIL_LAYOUT_FONT_FAMILY = FONT_FAMILY;

/** Locked preview/insert widths: mobile 360px, desktop 640px (email container). */
export const PREVIEW_DEVICE_WIDTHS = { mobile: 360, desktop: 640 } as const;
