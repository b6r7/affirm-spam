/**
 * Single source of truth for email layout: block ordering, spacing, and typography.
 * Used by BOTH the React preview and the Figma Insert-to-canvas builder.
 * To change spacing or tokens, edit this file and the layout constants below only.
 */

import type { LayoutMode, PreviewDevice, EmailContent } from '../../../figma-plugin/messageTypes';
import {
  getEmailLayoutSpec,
  PREVIEW_DEVICE_WIDTHS,
  AFFIRM_BLUE_PRIMARY_HEX,
} from '../../../figma-plugin/emailLayout';

// ─── Block ordering & schema ────────────────────────────────────────────────

export type BlockType =
  | 'header'
  | 'logo_spi'
  | 'attribution'
  | 'divider'
  | 'title'
  | 'greeting'
  | 'body'
  | 'footer'
  | 'hero'
  | 'cta'
  | 'legal';

export interface BlockItem {
  type: BlockType;
  visible: boolean;
  /** Text content for title, greeting, body, footer, legal, cta */
  content?: string;
  /** Fixed height for header or hero (px) */
  height?: number;
}

/** Single source for spacing/tokens — adjust here to change both preview and Figma. */
export interface EmailRenderSpec {
  layoutMode: LayoutMode;
  device: PreviewDevice;
  width: number;
  padding: number;
  sectionGap: number;
  ctaMarginTop: number;
  legalMarginTop: number;
  cornerRadius: number;
  headerHeight: number;
  heroHeight: number;
  dividerHeight: number;
  typography: {
    headingFontSize: number;
    headingLineHeight: number;
    headingFontWeight: number;
    bodyFontSize: number;
    bodyLineHeight: number;
    legalFontSize: number;
    legalLineHeight: number;
    ctaFontSize: number;
    ctaFontWeight: number;
  };
  ctaHeight: number;
  ctaCornerRadius: number;
  fill: { r: number; g: number; b: number };
  stroke: { r: number; g: number; b: number };
  /** Primary CTA color hex for React; Figma uses RGB from shared token. */
  ctaColorHex: string;
  blocks: BlockItem[];
}

const DIVIDER_HEIGHT = 1;
const ATTRIBUTION_LINE_GAP = 8;

/** Normalize dynamic tags from [Name] to {name} so preview and Figma layers both use {name}. */
export function normalizePlaceholderTags(s: string): string {
  if (typeof s !== 'string') return s;
  return s.replace(/\[([A-Za-z_][A-Za-z0-9_]*)\]/g, (_, tag) => `{${tag.toLowerCase()}}`);
}

/**
 * Builds the canonical email layout spec for a variant. Same input produces same spec
 * for preview and for Insert-to-canvas, so both renderers stay in sync.
 * Block order is driven by layoutMode:
 * - Affirm default: black header bar with white Affirm logo, then title/greeting/body/footer/cta/legal.
 * - SPI: ShopPay logo at top, then attribution line ("Installments…" + small Affirm mark), then divider, then content blocks (title → greeting → body → footer → hero → cta → legal).
 */
export function buildEmailLayoutSpec(params: {
  templateName: string;
  content: EmailContent;
  layoutMode: LayoutMode;
  device: PreviewDevice;
}): EmailRenderSpec {
  const { templateName, content, layoutMode, device } = params;
  const legacy = getEmailLayoutSpec(layoutMode);
  const width = PREVIEW_DEVICE_WIDTHS[device];
  const isSpi = layoutMode === 'spi';

  const blocks: BlockItem[] = [];

  // ─── Affirm default: header bar first ─────────────────────────────────────
  if (!isSpi && legacy.headerHeightAffirm > 0) {
    blocks.push({ type: 'header', visible: true, height: legacy.headerHeightAffirm });
  }

  // ─── SPI: top area (logo → attribution → divider), matching Figma reference ─
  if (isSpi) {
    blocks.push({ type: 'logo_spi', visible: true });
    blocks.push({ type: 'attribution', visible: true });
    blocks.push({ type: 'divider', visible: true, height: DIVIDER_HEIGHT });
  }

  // ─── Content blocks (same order for both modes) ───────────────────────────
  const n = normalizePlaceholderTags;
  const titleContent = content.title?.trim() || templateName || '—';
  blocks.push({ type: 'title', visible: true, content: n(titleContent) });
  blocks.push({ type: 'greeting', visible: true, content: n(content.greeting || '—') });
  blocks.push({ type: 'body', visible: true, content: n(content.body || '—') });
  blocks.push({
    type: 'footer',
    visible: Boolean(content.footer?.trim()),
    content: n(content.footer?.trim() ?? ''),
  });

  if (isSpi && legacy.heroHeight > 0) {
    blocks.push({ type: 'hero', visible: true, height: legacy.heroHeight });
  }

  blocks.push({ type: 'cta', visible: true, content: n(content.cta || 'CTA') });
  blocks.push({ type: 'legal', visible: true, content: n(content.legalText || '') });

  return {
    layoutMode,
    device,
    width,
    padding: legacy.padding,
    sectionGap: legacy.itemSpacing,
    ctaMarginTop: 16,
    legalMarginTop: 12,
    cornerRadius: legacy.cornerRadius,
    headerHeight: legacy.headerHeightAffirm,
    heroHeight: legacy.heroHeight,
    dividerHeight: DIVIDER_HEIGHT,
    typography: {
      headingFontSize: legacy.headingFontSize,
      headingLineHeight: legacy.headingLineHeight,
      headingFontWeight: legacy.headingFontWeight === 'semibold' ? 600 : 400,
      bodyFontSize: legacy.bodyFontSize,
      bodyLineHeight: legacy.bodyLineHeight,
      legalFontSize: legacy.legalFontSize,
      legalLineHeight: legacy.legalLineHeight,
      ctaFontSize: legacy.ctaFontSize,
      ctaFontWeight: legacy.ctaFontWeight === 'semibold' ? 600 : 400,
    },
    ctaHeight: legacy.ctaHeight,
    ctaCornerRadius: legacy.ctaCornerRadius,
    fill: legacy.fill,
    stroke: legacy.stroke,
    ctaColorHex: AFFIRM_BLUE_PRIMARY_HEX,
    blocks,
  };
}

export { ATTRIBUTION_LINE_GAP };
