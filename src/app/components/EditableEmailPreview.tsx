/**
 * Renders email spec with inline-editable text blocks. Commit on blur or Enter.
 * Preserves typography; subtle focus state, no layout jump.
 */

import React, { useState, useCallback, useRef, useLayoutEffect } from 'react';
import type { EmailRenderSpec, BlockItem } from '../../plugin/emailLayout/spec';
import type { EditableSlot } from '../lib/previewOverrides';
import { ATTRIBUTION_LINE_GAP } from '../../plugin/emailLayout/spec';
import { AFFIRM_LOGO_WHITE_SVG, SHOP_PAY_LOGO_SVG, AFFIRM_MARK_SMALL_SVG } from '../../plugin/icons';

const blockBase = { margin: 0, flexShrink: 0 } as const;
const px = (n: number) => `${n}px` as const;
const heroRgb = 'rgb(245, 245, 245)';
const HERO_PREVIEW_MAX_HEIGHT = 220;
const CONTENT_PADDING_AFFIRM = 24;

function blockTypeToSlot(type: BlockItem['type']): EditableSlot | null {
  switch (type) {
    case 'title': return 'title';
    case 'greeting': return 'greeting';
    case 'body': return 'body';
    case 'footer': return 'footer';
    case 'cta': return 'cta';
    case 'legal': return 'legalText';
    default: return null;
  }
}

interface EditableBlockProps {
  spec: EmailRenderSpec;
  block: BlockItem;
  slot: EditableSlot;
  onEdit: (slot: EditableSlot, value: string) => void;
  multiline?: boolean;
}

function EditableBlock({ spec, block, slot, onEdit, multiline }: EditableBlockProps) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const value = block.content ?? '';

  useLayoutEffect(() => {
    if (ref.current && !focused) ref.current.textContent = value || '—';
  }, [value, focused]);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      setFocused(false);
      const next = (e.currentTarget.textContent ?? '').trim();
      onEdit(slot, next || '');
    },
    [onEdit, slot]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !multiline) {
        e.preventDefault();
        (e.target as HTMLDivElement).blur();
      }
    },
    [multiline]
  );

  const isTitle = block.type === 'title';
  const isCta = block.type === 'cta';
  const isLegal = block.type === 'legal';

  const baseStyle: React.CSSProperties = isTitle
    ? {
        ...blockBase,
        fontSize: px(spec.typography.headingFontSize),
        lineHeight: px(spec.typography.headingLineHeight),
        fontWeight: spec.typography.headingFontWeight,
        color: 'var(--foreground)',
      }
    : isCta
      ? {
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
        }
      : isLegal
        ? {
            ...blockBase,
            marginTop: spec.legalMarginTop,
            fontSize: px(spec.typography.legalFontSize),
            lineHeight: px(spec.typography.legalLineHeight),
            color: 'var(--muted-foreground)',
          }
        : {
            ...blockBase,
            fontSize: px(spec.typography.bodyFontSize),
            lineHeight: px(spec.typography.bodyLineHeight),
            color: 'var(--foreground)',
            ...(block.type === 'body' && { whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const }),
          };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      style={{
        ...baseStyle,
        outline: 'none',
        minHeight: isCta ? undefined : 20,
        borderRadius: focused ? 4 : 0,
        boxShadow: focused ? '0 0 0 2px var(--accent)' : 'none',
      }}
    />
  );
}

export interface EditableEmailPreviewProps {
  spec: EmailRenderSpec;
  onEdit: (slot: EditableSlot, value: string) => void;
}

export function EditableEmailPreview({ spec, onEdit }: EditableEmailPreviewProps) {
  const cardFillRgb = `rgb(${Math.round(spec.fill.r * 255)}, ${Math.round(spec.fill.g * 255)}, ${Math.round(spec.fill.b * 255)})`;
  const headerBlock = spec.blocks.find((b) => b.type === 'header' && b.visible);
  const contentBlocks = spec.blocks.filter((b) => b.type !== 'header');
  const isAffirm = spec.layoutMode === 'affirm';
  const cardPadding = isAffirm ? 0 : spec.padding;
  const contentPadding = isAffirm ? CONTENT_PADDING_AFFIRM : spec.padding;

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
          const key = `${block.type}-${index}`;
          const slot = blockTypeToSlot(block.type);

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
            case 'greeting':
            case 'body':
            case 'footer':
            case 'cta':
            case 'legal':
              if (slot) {
                return (
                  <EditableBlock
                    key={key}
                    spec={spec}
                    block={block}
                    slot={slot}
                    onEdit={onEdit}
                    multiline={block.type === 'body'}
                  />
                );
              }
              return null;
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
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
