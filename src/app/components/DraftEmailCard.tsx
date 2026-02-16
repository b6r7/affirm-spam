import { Locale } from '../data/contentData';
import { getHeaderHeight, AFFIRM_BLUE_PRIMARY_HEX } from 'figma-plugin/emailLayout';

type PreviewDevice = 'mobile' | 'desktop';

interface DraftEmailCardProps {
  draftText: string;
  templateName: string;
  locale: Locale;
  previewDevice?: PreviewDevice;
}

function parseDraftText(text: string): {
  greeting: string;
  body: string;
  footer: string;
  cta: string;
} {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return {
      greeting: '',
      body: '',
      footer: '',
      cta: '',
    };
  }

  let greeting = '';
  let body = '';
  let footer = '';
  let cta = 'Make a payment';
  
  if (lines.length >= 1) {
    const firstLine = lines[0];
    if (firstLine.includes('[') || firstLine.endsWith(',')) {
      greeting = firstLine;
      body = lines.slice(1).join('\n\n');
    } else {
      body = lines.join('\n\n');
    }
    
    if (lines.length >= 2) {
      const lastLine = lines[lines.length - 1];
      if (lastLine.length < 100 && (
        lastLine.toLowerCase().includes('help') ||
        lastLine.toLowerCase().includes('questions') ||
        lastLine.toLowerCase().includes('contact') ||
        lastLine.toLowerCase().includes('available') ||
        lastLine.toLowerCase().includes('aquí') ||
        lastLine.toLowerCase().includes('disponible')
      )) {
        footer = lastLine;
        if (greeting) {
          body = lines.slice(1, -1).join('\n\n');
        } else {
          body = lines.slice(0, -1).join('\n\n');
        }
      }
    }
  }
  
  return { greeting, body, footer, cta };
}

export function DraftEmailCard({ draftText, templateName, locale, previewDevice = 'desktop' }: DraftEmailCardProps) {
  const parsed = parseDraftText(draftText);
  const isEmpty = draftText.trim() === '';
  const headerHeight = getHeaderHeight(previewDevice);

  return (
    <div className="w-full">
      <div
        className="mb-3"
        style={{
          fontFamily: 'Calibre, sans-serif',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--muted-foreground)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Draft template preview
      </div>

      <div
        style={{
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          minHeight: '400px',
          position: 'relative',
          overflow: 'hidden',
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
        <div style={{ padding: '24px' }}>
        {isEmpty ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '350px',
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
            }}
          >
            Start typing to preview your template
          </div>
        ) : (
          <div>
            {parsed.greeting && (
              <div
                className="mb-4"
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-base)',
                  color: 'var(--foreground)',
                }}
              >
                {parsed.greeting}
              </div>
            )}
            
            {parsed.body && (
              <div
                className="mb-6"
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-base)',
                  color: 'var(--foreground)',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {parsed.body}
              </div>
            )}
            
            <div className="mb-6">
              <button
                disabled
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'white',
                  backgroundColor: AFFIRM_BLUE_PRIMARY_HEX,
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-button)',
                  border: 'none',
                  cursor: 'default',
                  opacity: 0.8,
                }}
              >
                {parsed.cta}
              </button>
            </div>
            
            {parsed.footer && (
              <div
                className="mb-4"
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)',
                }}
              >
                {parsed.footer}
              </div>
            )}
            
            <div
              className="pt-4 mt-4"
              style={{
                borderTop: '1px solid var(--border)',
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-xs)',
                color: 'var(--muted-foreground)',
                lineHeight: '1.4',
              }}
            >
              Loans made or arranged pursuant to applicable law. Affirm Loan Services, LLC.
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}