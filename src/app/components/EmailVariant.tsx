import { useEffect, useRef, useCallback, useLayoutEffect, useState } from 'react';
import { Variant, EmailContent, ComplianceIssue, Locale } from '../data/contentData';
import { getHeaderHeight, AFFIRM_BLUE_PRIMARY_HEX } from 'figma-plugin/emailLayout';
import type { EditableSlot } from '../lib/previewOverrides';

type PreviewDevice = 'mobile' | 'desktop';

interface EmailVariantProps {
  variant: Variant;
  tone: string;
  content: EmailContent;
  hasWarning?: boolean;
  isSelected?: boolean;
  variantId?: string;
  complianceIssues?: ComplianceIssue[];
  locale?: Locale;
  previewDevice?: PreviewDevice;
  /** Web app: make text blocks inline-editable; commits on blur/Enter */
  editable?: boolean;
  onEdit?: (slot: EditableSlot, value: string) => void;
}

function highlightText(text: string, issues: ComplianceIssue[]): React.ReactNode {
  if (!issues || issues.length === 0) {
    return text;
  }

  let parts: React.ReactNode[] = [];
  let lastIndex = 0;

  issues.forEach((issue) => {
    const problematicPhrase = issue.problematicPhrase;
    const index = text.indexOf(problematicPhrase, lastIndex);
    
    if (index !== -1) {
      if (index > lastIndex) {
        parts.push(text.substring(lastIndex, index));
      }
      
      parts.push(
        <span
          key={`highlight-${index}`}
          style={{
            backgroundColor: 'rgba(232, 140, 49, 0.15)',
            borderRadius: '4px',
            padding: '2px 4px',
          }}
        >
          {problematicPhrase}
        </span>
      );
      
      lastIndex = index + problematicPhrase.length;
    }
  });

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

function EditableBlock({
  slot,
  value,
  onEdit,
  style,
  multiline,
}: {
  slot: EditableSlot;
  value: string;
  onEdit: (slot: EditableSlot, value: string) => void;
  style: React.CSSProperties;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

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
        ...style,
        outline: 'none',
        minHeight: 20,
        borderRadius: focused ? 4 : 0,
        boxShadow: focused ? '0 0 0 2px var(--accent)' : 'none',
      }}
    />
  );
}

export function EmailVariant({ variant, tone, content, hasWarning, isSelected, variantId, complianceIssues = [], locale, previewDevice = 'desktop', editable = false, onEdit }: EmailVariantProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const headerHeight = getHeaderHeight(previewDevice);

  useEffect(() => {
    if (variantId && frameRef.current) {
      frameRef.current.id = variantId;
    }
  }, [variantId]);

  const baseTextStyle: React.CSSProperties = {
    fontFamily: 'Calibre, sans-serif',
    fontSize: 'var(--text-base)',
    color: 'var(--foreground)',
  };
  const legalStyle: React.CSSProperties = {
    fontFamily: 'Calibre, sans-serif',
    fontSize: 'var(--text-xs)',
    color: 'var(--muted-foreground)',
    lineHeight: '1.4',
  };

  return (
    <div className="flex flex-col gap-3">
      <div 
        style={{
          fontFamily: 'Calibre, sans-serif',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--muted-foreground)',
        }}
      >
        Variant {variant} – {tone}
      </div>
      <div 
        ref={frameRef}
        className="bg-card flex flex-col transition-all duration-200 overflow-hidden"
        style={{
          borderRadius: 'var(--radius)',
          minHeight: '400px',
          border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
          boxShadow: isSelected ? '0 0 0 3px rgba(74, 74, 244, 0.1)' : 'none',
        }}
      >
        <div
          style={{
            height: headerHeight,
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 600, letterSpacing: '0.02em' }}>affirm</span>
        </div>
        <div className="p-8 flex flex-col gap-4">
          {editable && onEdit ? (
            <EditableBlock slot="greeting" value={content.greeting} onEdit={onEdit} style={baseTextStyle} />
          ) : (
            <div style={baseTextStyle}>{content.greeting}</div>
          )}

          {editable && onEdit ? (
            <EditableBlock
              slot="body"
              value={content.body}
              onEdit={onEdit}
              style={{ ...baseTextStyle, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              multiline
            />
          ) : (
            <div style={baseTextStyle}>{highlightText(content.body, complianceIssues)}</div>
          )}

          {hasWarning && content.warning && (
            <div 
              className="border-2 p-3"
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-base)',
                color: 'var(--foreground)',
                borderColor: 'rgba(232, 140, 49, 0.4)',
                backgroundColor: 'rgba(232, 140, 49, 0.05)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {highlightText(content.warning, complianceIssues)}
            </div>
          )}

          {content.footer !== undefined && (editable && onEdit ? (
            <EditableBlock slot="footer" value={content.footer} onEdit={onEdit} style={baseTextStyle} />
          ) : content.footer ? (
            <div style={baseTextStyle}>{content.footer}</div>
          ) : null)}

        <div className="mt-auto">
          {editable && onEdit ? (
            <EditableBlock
              slot="cta"
              value={content.cta}
              onEdit={onEdit}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: AFFIRM_BLUE_PRIMARY_HEX,
                borderRadius: 'var(--radius-button)',
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: '#fff',
                border: 'none',
                cursor: 'text',
              }}
            />
          ) : (
            <button
              className="px-6 py-3 text-white"
              style={{
                backgroundColor: AFFIRM_BLUE_PRIMARY_HEX,
                borderRadius: 'var(--radius-button)',
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {content.cta}
            </button>
          )}
        </div>

        {editable && onEdit ? (
          <EditableBlock slot="legalText" value={content.legalText} onEdit={onEdit} style={{ ...legalStyle, marginTop: 16 }} />
        ) : (
          <div className="mt-4" style={legalStyle}>
            {content.legalText}
          </div>
        )}

        <div 
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
            textDecoration: 'underline',
          }}
        >
          Unsubscribe · Privacy settings
        </div>
        </div>
      </div>
    </div>
  );
}