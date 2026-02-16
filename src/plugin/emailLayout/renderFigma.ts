/**
 * Renders EmailRenderSpec to Figma nodes (Insert to canvas). Same block order as spec.blocks.
 * Colors, radii, spacing from tokens.ts only — no inline hex/rgb.
 * Autolayout: only AUTO or FIXED; layoutSizing only set on children after append to card.
 */

import type { EmailRenderSpec, BlockItem } from './spec';
import { ATTRIBUTION_LINE_GAP } from './spec';
import { AFFIRM_LOGO_WHITE_SVG, SHOP_PAY_LOGO_SVG, AFFIRM_MARK_SMALL_SVG } from '../icons';
import {
  CTA_LABEL_FILL,
  STROKE_DEFAULT,
} from './tokens';

export type SpacingBindableField = 'itemSpacing' | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'paddingBottom';

export interface FigmaRenderContext {
  card: FrameNode;
  cardWidth: number;
  font: FontName;
  headingFont: FontName;
  ctaFont: FontName;
  legalFill: RGB;
  ctaFill: RGB;
  headerFill: RGB;
  heroFill: RGB;
  strokeColor: RGB;
  /** When set, use Genome variable bindings for spacing; otherwise use px. */
  applySpacing?: (node: FrameNode, field: SpacingBindableField, tokenKey: string, pxFallback: number) => void;
}

export function renderSpecToFigma(spec: EmailRenderSpec, ctx: FigmaRenderContext): void {
  const { card, cardWidth, font, headingFont, ctaFont, legalFill, ctaFill, headerFill, heroFill } = ctx;
  const lineHeightHeading = { value: spec.typography.headingLineHeight, unit: 'PIXELS' as const };
  const lineHeightBody = { value: spec.typography.bodyLineHeight, unit: 'PIXELS' as const };
  const lineHeightLegal = { value: spec.typography.legalLineHeight, unit: 'PIXELS' as const };

  const isAffirm = spec.layoutMode === 'affirm';

  for (const block of spec.blocks) {
    if (!block.visible) continue;
    switch (block.type) {
      case 'header': {
        const headerFrame = figma.createFrame();
        headerFrame.name = 'Header';
        headerFrame.layoutMode = 'HORIZONTAL';
        headerFrame.primaryAxisSizingMode = 'AUTO';
        headerFrame.counterAxisSizingMode = 'FIXED';
        headerFrame.primaryAxisAlignItems = 'CENTER';
        headerFrame.counterAxisAlignItems = 'CENTER';
        const headerHeight = block.height ?? spec.headerHeight;
        headerFrame.resize(cardWidth, headerHeight);
        headerFrame.fills = [{ type: 'SOLID', color: headerFill }];
        try {
          const logoNode = figma.createNodeFromSvg(AFFIRM_LOGO_WHITE_SVG);
          headerFrame.appendChild(logoNode);
        } catch {
          const fallback = figma.createText();
          fallback.fontName = headingFont;
          fallback.fontSize = 16;
          fallback.characters = 'affirm';
          fallback.fills = [{ type: 'SOLID', color: CTA_LABEL_FILL }];
          headerFrame.appendChild(fallback);
        }
        card.appendChild(headerFrame);
        if (isAffirm) {
          headerFrame.layoutPositioning = 'ABSOLUTE';
          headerFrame.x = 0;
          headerFrame.y = 0;
        } else {
          headerFrame.layoutSizingHorizontal = 'FILL';
        }
        break;
      }
      case 'logo_spi': {
        try {
          const shopPayNode = figma.createNodeFromSvg(SHOP_PAY_LOGO_SVG);
          card.appendChild(shopPayNode);
          shopPayNode.layoutSizingHorizontal = 'HUG';
        } catch {
          /* skip */
        }
        break;
      }
      case 'attribution': {
        const row = figma.createFrame();
        row.name = 'Installments line';
        row.layoutMode = 'HORIZONTAL';
        row.primaryAxisSizingMode = 'AUTO';
        row.counterAxisSizingMode = 'AUTO';
        row.primaryAxisAlignItems = 'MIN';
        row.counterAxisAlignItems = 'CENTER';
        if (ctx.applySpacing) {
          ctx.applySpacing(row, 'itemSpacing', 'attributionGap', ATTRIBUTION_LINE_GAP);
        } else {
          row.itemSpacing = ATTRIBUTION_LINE_GAP;
        }
        const text = figma.createText();
        text.fontName = font;
        text.fontSize = spec.typography.legalFontSize;
        text.lineHeight = lineHeightLegal;
        text.characters = 'Installments are provided and serviced by';
        text.textAlignHorizontal = 'LEFT';
        text.textAutoResize = 'HEIGHT';
        text.fills = [{ type: 'SOLID', color: legalFill }];
        row.appendChild(text);
        text.layoutSizingHorizontal = 'HUG';
        try {
          const mark = figma.createNodeFromSvg(AFFIRM_MARK_SMALL_SVG);
          row.appendChild(mark);
          mark.layoutSizingHorizontal = 'HUG';
        } catch {
          /* skip */
        }
        card.appendChild(row);
        row.layoutSizingHorizontal = 'FILL';
        break;
      }
      case 'divider': {
        const line = figma.createFrame();
        line.name = 'Divider';
        line.resize(cardWidth, block.height ?? spec.dividerHeight);
        line.fills = [{ type: 'SOLID', color: STROKE_DEFAULT }];
        card.appendChild(line);
        line.layoutSizingHorizontal = 'FILL';
        break;
      }
      case 'title': {
        const text = figma.createText();
        text.fontName = headingFont;
        text.fontSize = spec.typography.headingFontSize;
        text.lineHeight = lineHeightHeading;
        text.characters = block.content ?? '—';
        text.textAlignHorizontal = 'LEFT';
        text.textAutoResize = 'HEIGHT';
        card.appendChild(text);
        text.layoutSizingHorizontal = 'FILL';
        break;
      }
      case 'greeting': {
        const text = figma.createText();
        text.fontName = font;
        text.fontSize = spec.typography.bodyFontSize;
        text.lineHeight = lineHeightBody;
        text.characters = block.content ?? '—';
        text.textAlignHorizontal = 'LEFT';
        text.textAutoResize = 'HEIGHT';
        card.appendChild(text);
        text.layoutSizingHorizontal = 'FILL';
        break;
      }
      case 'body': {
        const text = figma.createText();
        text.fontName = font;
        text.fontSize = spec.typography.bodyFontSize;
        text.lineHeight = lineHeightBody;
        text.characters = block.content ?? '—';
        text.textAlignHorizontal = 'LEFT';
        text.textAutoResize = 'HEIGHT';
        card.appendChild(text);
        text.layoutSizingHorizontal = 'FILL';
        text.layoutSizingVertical = 'HUG';
        break;
      }
      case 'footer': {
        const text = figma.createText();
        text.fontName = font;
        text.fontSize = spec.typography.bodyFontSize;
        text.lineHeight = lineHeightBody;
        text.characters = block.content ?? '';
        text.textAlignHorizontal = 'LEFT';
        text.textAutoResize = 'HEIGHT';
        card.appendChild(text);
        text.layoutSizingHorizontal = 'FILL';
        break;
      }
      case 'hero': {
        const heroFrame = figma.createFrame();
        heroFrame.name = 'Hero';
        heroFrame.layoutMode = 'HORIZONTAL';
        heroFrame.primaryAxisSizingMode = 'AUTO';
        heroFrame.counterAxisSizingMode = 'FIXED';
        heroFrame.primaryAxisAlignItems = 'CENTER';
        heroFrame.counterAxisAlignItems = 'CENTER';
        heroFrame.resize(cardWidth, block.height ?? spec.heroHeight);
        heroFrame.fills = [{ type: 'SOLID', color: heroFill }];
        heroFrame.cornerRadius = spec.cornerRadius;
        card.appendChild(heroFrame);
        heroFrame.layoutSizingHorizontal = 'FILL';
        break;
      }
      case 'cta': {
        const ctaFrame = figma.createFrame();
        ctaFrame.name = 'CTA';
        ctaFrame.layoutMode = 'HORIZONTAL';
        ctaFrame.primaryAxisSizingMode = 'AUTO';
        ctaFrame.counterAxisSizingMode = 'FIXED';
        ctaFrame.primaryAxisAlignItems = 'CENTER';
        ctaFrame.counterAxisAlignItems = 'CENTER';
        ctaFrame.resize(cardWidth, spec.ctaHeight);
        ctaFrame.fills = [{ type: 'SOLID', color: ctaFill }];
        ctaFrame.cornerRadius = spec.ctaCornerRadius;
        const label = figma.createText();
        label.fontName = ctaFont;
        label.fontSize = spec.typography.ctaFontSize;
        label.characters = block.content ?? 'CTA';
        label.textAlignHorizontal = 'CENTER';
        label.fills = [{ type: 'SOLID', color: CTA_LABEL_FILL }];
        label.textAutoResize = 'NONE';
        ctaFrame.appendChild(label);
        card.appendChild(ctaFrame);
        ctaFrame.layoutSizingHorizontal = 'FILL';
        ctaFrame.layoutSizingVertical = 'FIXED';
        break;
      }
      case 'legal': {
        const text = figma.createText();
        text.fontName = font;
        text.fontSize = spec.typography.legalFontSize;
        text.lineHeight = lineHeightLegal;
        text.characters = block.content ?? '';
        text.textAlignHorizontal = 'LEFT';
        text.textAutoResize = 'HEIGHT';
        text.fills = [{ type: 'SOLID', color: legalFill }];
        card.appendChild(text);
        text.layoutSizingHorizontal = 'FILL';
        break;
      }
      default:
        break;
    }
  }
}
