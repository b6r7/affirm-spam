/**
 * Renders EmailRenderSpec to React (preview). Single source of block order: spec.blocks.
 * Spacing and typography come from spec only — see spec.ts to adjust.
 *
 * Preview parity with canvas: we use a vertical stack with explicit gap only.
 * We avoid justify-content: space-between and flex-grow so no phantom vertical space;
 * the card height is content-driven (height: auto).
 */

import React from 'react';
import type { EmailRenderSpec, BlockItem } from './spec';
import { ATTRIBUTION_LINE_GAP } from './spec';
import { AFFIRM_LOGO_WHITE_SVG, SHOP_PAY_LOGO_SVG, AFFIRM_MARK_SMALL_SVG } from '../icons';

const heroRgb = 'rgb(245, 245, 245)';

/** Sane max height for hero placeholder when layout includes it (SPI). */
const HERO_PREVIEW_MAX_HEIGHT = 220;

function blockKey(block: BlockItem, index: number): string {
  return `${block.type}-${index}`;
}

const CONTENT_PADDING_AFFIRM = 24;

const blockBase = { margin: 0, flexShrink: 0 } as const;

/** Spec typography values are in pixels; CSS line-height must be px (unitless = multiplier, causing huge height). */
const px = (n: number) => `${n}px` as const;

export function RenderSpecToReact({ spec }: { spec: EmailRenderSpec }) {
  const cardFillRgb = `rgb(${Math.round(spec.fill.r * 255)}, ${Math.round(spec.fill.g * 255)}, ${Math.round(spec.fill.b * 255)})`;
  const headerBlock = spec.blocks.find((b) => b.type === 'header' && b.visible);
  const contentBlocks = spec.blocks.filter((b) => b.type !== 'header');
  const isAffirm = spec.layoutMode === 'affirm';
  const cardPadding = isAffirm ? 0 : spec.padding;
  const contentPadding = isAffirm ? CONTENT_PADDING_AFFIRM : spec.padding;

  // Use display: block so no flex distribution; spacing is gap-only in the content stack (parity with canvas).
  return (
    <div
      style={{
        fontFamily: 'Inter, Calibre, sans-serif',
        width: spec.width,
        boxSizing: 'border-box',
        backgroundColor: cardFillRgb,
        borderColor: 'var(--border)',
        borderRadius: spec.cornerRadius,
        display: 'block',
        padding: cardPadding,
        overflow: isAffirm ? 'hidden' : undefined,
      }}
    >
      {headerBlock && (
        <div
          style={{
            ...blockBase,
            height: headerBlock.height,
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTopLeftRadius: spec.cornerRadius,
            borderTopRightRadius: spec.cornerRadius,
          }}
        >
          <span
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: AFFIRM_LOGO_WHITE_SVG }}
          />
        </div>
      )}
      <div
        style={{
          boxSizing: 'border-box',
          padding: contentPadding,
          display: 'flex',
          flexDirection: 'column',
          gap: spec.sectionGap,
          alignItems: 'stretch',
          justifyContent: 'flex-start',
        }}
      >
        {contentBlocks.map((block, index) => {
          if (!block.visible) return null;
          const key = blockKey(block, index);
          switch (block.type) {
            case 'logo_spi':
              return (
                <div key={key} style={{ ...blockBase, display: 'flex', justifyContent: 'flex-start' }}>
                  <span
                    style={{ display: 'inline-block', verticalAlign: 'top' }}
                    dangerouslySetInnerHTML={{ __html: SHOP_PAY_LOGO_SVG }}
                  />
                </div>
              );
            case 'attribution':
              return (
                <div
                  key={key}
                  style={{
                    ...blockBase,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: ATTRIBUTION_LINE_GAP,
                    flexWrap: 'wrap',
                    fontSize: px(spec.typography.legalFontSize),
                    lineHeight: px(spec.typography.legalLineHeight),
                    color: 'var(--muted-foreground)',
                  }}
                >
                  <span style={{ margin: 0 }}>Installments are provided and serviced by</span>
                  <span
                    style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, margin: 0 }}
                    dangerouslySetInnerHTML={{ __html: AFFIRM_MARK_SMALL_SVG }}
                  />
                </div>
              );
            case 'divider':
              return (
                <div
                  key={key}
                  style={{
                    ...blockBase,
                    height: block.height ?? spec.dividerHeight,
                    backgroundColor: 'var(--border)',
                    width: '100%',
                  }}
                />
              );
            case 'title':
              return (
                <div
                  key={key}
                  style={{
                    ...blockBase,
                    fontSize: px(spec.typography.headingFontSize),
                    lineHeight: px(spec.typography.headingLineHeight),
                    fontWeight: spec.typography.headingFontWeight,
                    color: 'var(--foreground)',
                  }}
                >
                  {block.content ?? '—'}
                </div>
              );
            case 'greeting':
              return (
                <div
                  key={key}
                  style={{
                    ...blockBase,
                    fontSize: px(spec.typography.bodyFontSize),
                    lineHeight: px(spec.typography.bodyLineHeight),
                    color: 'var(--foreground)',
                  }}
                >
                  {block.content ?? '—'}
                </div>
              );
            case 'body':
              return (
                <div
                  key={key}
                  style={{
                    ...blockBase,
                    fontSize: px(spec.typography.bodyFontSize),
                    lineHeight: px(spec.typography.bodyLineHeight),
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'var(--foreground)',
                  }}
                >
                  {block.content ?? '—'}
                </div>
              );
            case 'footer':
              return (
                <div
                  key={key}
                  style={{
                    ...blockBase,
                    fontSize: px(spec.typography.bodyFontSize),
                    lineHeight: px(spec.typography.bodyLineHeight),
                    color: 'var(--foreground)',
                  }}
                >
                  {block.content}
                </div>
              );
            case 'hero':
              return (
                <div
                  key={key}
                  style={{
                    ...blockBase,
                    height: Math.min(block.height ?? spec.heroHeight, HERO_PREVIEW_MAX_HEIGHT),
                    backgroundColor: heroRgb,
                    borderRadius: spec.cornerRadius,
                    display: 'block',
                  }}
                />
              );
            case 'cta':
              return (
                <div
                  key={key}
                  style={{
                    ...blockBase,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: spec.ctaHeight,
                    marginTop: spec.ctaMarginTop,
                    paddingLeft: 12,
                    paddingRight: 12,
                    backgroundColor: spec.ctaColorHex,
                    color: 'white',
                    borderRadius: spec.ctaCornerRadius,
                    fontSize: px(spec.typography.ctaFontSize),
                    fontWeight: spec.typography.ctaFontWeight,
                  }}
                >
                  {block.content ?? 'CTA'}
                </div>
              );
            case 'legal':
              return (
                <div
                  key={key}
                  style={{
                    ...blockBase,
                    marginTop: spec.legalMarginTop,
                    fontSize: px(spec.typography.legalFontSize),
                    lineHeight: px(spec.typography.legalLineHeight),
                    color: 'var(--muted-foreground)',
                  }}
                >
                  {block.content}
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
