export function TokensDocumentation() {
  return (
    <div
      style={{
        backgroundColor: 'var(--background)',
        minHeight: '100vh',
        padding: '48px',
        fontFamily: 'Calibre, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: 'Axiforma, sans-serif',
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--foreground)',
            marginBottom: '8px',
          }}
        >
          Design Tokens Snapshot
        </h1>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
            marginBottom: '48px',
          }}
        >
          Affirm SPAM · Design System Reference
        </div>

        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'Axiforma, sans-serif',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--foreground)',
              marginBottom: '24px',
            }}
          >
            Color Tokens
          </h2>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            <TokenRow
              name="--background"
              value="rgba(242, 242, 244, 1.00)"
              hex="#F2F2F4"
              usage="Main canvas background"
              swatchColor="rgba(242, 242, 244, 1.00)"
            />

            <TokenRow
              name="--card"
              value="rgba(255, 255, 255, 1.00)"
              hex="#FFFFFF"
              usage="Email variant cards, modals, panels"
              swatchColor="rgba(255, 255, 255, 1.00)"
              hasBorder
            />

            <TokenRow
              name="--border"
              value="rgba(209, 213, 219, 1.00)"
              hex="#D1D5DB"
              usage="Card borders, dividers, input outlines"
              swatchColor="rgba(209, 213, 219, 1.00)"
            />

            <TokenRow
              name="--foreground"
              value="rgba(12, 12, 20, 1.00)"
              hex="#0C0C14"
              usage="Primary text color"
              swatchColor="rgba(12, 12, 20, 1.00)"
            />

            <TokenRow
              name="--muted-foreground"
              value="rgba(75, 75, 92, 1.00)"
              hex="#4B4B5C"
              usage="Secondary labels, helper text, metadata"
              swatchColor="rgba(75, 75, 92, 1.00)"
            />

            <TokenRow
              name="--accent"
              value="rgba(74, 74, 244, 1.00)"
              hex="#4A4AF4"
              usage="Primary CTAs, links, interactive elements"
              swatchColor="rgba(74, 74, 244, 1.00)"
            />

            <TokenRow
              name="--chart-5 (warning)"
              value="rgba(232, 140, 49, 1.00)"
              hex="#E88C31"
              usage="Compliance warnings, phrase highlights"
              swatchColor="rgba(232, 140, 49, 1.00)"
            />

            <TokenRow
              name="--chart-4 (success)"
              value="rgba(10, 137, 76, 1.00)"
              hex="#0A894C"
              usage="Confirmation states, resolved compliance"
              swatchColor="rgba(10, 137, 76, 1.00)"
              isLast
            />
          </div>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'Axiforma, sans-serif',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--foreground)',
              marginBottom: '24px',
            }}
          >
            Border Radius Tokens
          </h2>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            <RadiusRow
              name="--radius"
              value="0.5rem"
              px="8px"
              usage="Default containers, panels, dropdowns"
            />

            <RadiusRow
              name="--radius-sm"
              value="calc(var(--radius) - 2px)"
              px="6px"
              usage="Small elements, tags, inner components"
            />

            <RadiusRow
              name="--radius-card"
              value="1rem"
              px="16px"
              usage="Email variant cards, large containers"
            />

            <RadiusRow
              name="--radius-button"
              value="1.5rem"
              px="24px"
              usage="Buttons, pill-shaped elements"
              isLast
            />
          </div>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'Axiforma, sans-serif',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--foreground)',
              marginBottom: '24px',
            }}
          >
            Typography Tokens
          </h2>

          <div
            style={{
              marginBottom: '24px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            <TypographyRow
              name="--text-xs"
              value="13px"
              usage="Metadata, captions, tiny labels"
              fontSize="13px"
            />

            <TypographyRow
              name="--text-sm"
              value="14px"
              usage="Body text in panels, labels, descriptions"
              fontSize="14px"
            />

            <TypographyRow
              name="--text-base"
              value="16px"
              usage="Default body text, standard content"
              fontSize="16px"
            />

            <TypographyRow
              name="--text-lg"
              value="18px"
              usage="Emphasized body text, email content"
              fontSize="18px"
            />

            <TypographyRow
              name="--text-xl"
              value="24px"
              usage="Section headings, panel titles"
              fontSize="24px"
            />

            <TypographyRow
              name="--text-2xl"
              value="32px"
              usage="Page titles, major headings"
              fontSize="32px"
              isLast
            />
          </div>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            <WeightRow
              name="--font-weight-regular"
              value="400"
              usage="Body text, descriptions"
              weight="400"
            />

            <WeightRow
              name="--font-weight-medium"
              value="500"
              usage="Labels, buttons, emphasized text"
              weight="500"
            />

            <WeightRow
              name="--font-weight-semibold"
              value="600"
              usage="Headings, section titles"
              weight="600"
              isLast
            />
          </div>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'Axiforma, sans-serif',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--foreground)',
              marginBottom: '24px',
            }}
          >
            Font Families
          </h2>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            <FontFamilyRow
              name="Axiforma"
              usage="Headings, section titles, panel headers"
              family="Axiforma, sans-serif"
              example="Email Template Builder"
            />

            <FontFamilyRow
              name="Calibre"
              usage="Body text, labels, buttons, all UI controls"
              family="Calibre, sans-serif"
              example="The quick brown fox jumps over the lazy dog"
              isLast
            />
          </div>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'Axiforma, sans-serif',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--foreground)',
              marginBottom: '24px',
            }}
          >
            Real-World Usage
          </h2>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              backgroundColor: 'var(--card)',
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '12px',
                }}
              >
                Primary CTA Button
              </div>
              <button
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-button)',
                  border: 'none',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer',
                }}
              >
                Generate variants
              </button>
              <div
                style={{
                  marginTop: '8px',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--muted-foreground)',
                }}
              >
                Uses: <code style={codeStyle}>--accent</code>,{' '}
                <code style={codeStyle}>--radius-button</code>,{' '}
                <code style={codeStyle}>--text-sm</code>,{' '}
                <code style={codeStyle}>--font-weight-medium</code>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '12px',
                }}
              >
                Compliance Warning
              </div>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(232, 140, 49, 0.04)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(232, 140, 49, 0.15)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--foreground)',
                  }}
                >
                  Aggressive language detected
                </span>
              </div>
              <div
                style={{
                  marginTop: '8px',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--muted-foreground)',
                }}
              >
                Uses: <code style={codeStyle}>rgba(232, 140, 49, 0.04)</code> background,{' '}
                <code style={codeStyle}>--radius-sm</code>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '12px',
                }}
              >
                Success Confirmation
              </div>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(10, 137, 76, 0.05)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(10, 137, 76, 0.2)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--foreground)',
                  }}
                >
                  No UDAAP issues detected
                </span>
              </div>
              <div
                style={{
                  marginTop: '8px',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--muted-foreground)',
                }}
              >
                Uses: <code style={codeStyle}>rgba(10, 137, 76, 0.05)</code> background,{' '}
                <code style={codeStyle}>--radius-sm</code>
              </div>
            </div>
          </div>
        </section>

        <div
          style={{
            marginTop: '64px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border)',
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
            textAlign: 'center',
          }}
        >
          Design Tokens Reference · All tokens defined in /src/styles/theme.css
        </div>
      </div>
    </div>
  );
}

interface TokenRowProps {
  name: string;
  value: string;
  hex: string;
  usage: string;
  swatchColor: string;
  hasBorder?: boolean;
  isLast?: boolean;
}

function TokenRow({ name, value, hex, usage, swatchColor, hasBorder, isLast }: TokenRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: 'var(--card)',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: swatchColor,
          border: hasBorder ? '1px solid var(--border)' : 'none',
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--foreground)',
            marginBottom: '4px',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
            marginBottom: '4px',
          }}
        >
          {value} · {hex}
        </div>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--foreground)',
          }}
        >
          {usage}
        </div>
      </div>
    </div>
  );
}

interface RadiusRowProps {
  name: string;
  value: string;
  px: string;
  usage: string;
  isLast?: boolean;
}

function RadiusRow({ name, value, px, usage, isLast }: RadiusRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: 'var(--card)',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          backgroundColor: 'var(--accent)',
          borderRadius: value.startsWith('calc') ? 'calc(var(--radius) - 2px)' : value,
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--foreground)',
            marginBottom: '4px',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
            marginBottom: '4px',
          }}
        >
          {value} · {px}
        </div>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--foreground)',
          }}
        >
          {usage}
        </div>
      </div>
    </div>
  );
}

interface TypographyRowProps {
  name: string;
  value: string;
  usage: string;
  fontSize: string;
  isLast?: boolean;
}

function TypographyRow({ name, value, usage, fontSize, isLast }: TypographyRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: 'var(--card)',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '80px',
          fontFamily: 'Calibre, sans-serif',
          fontSize: fontSize,
          color: 'var(--foreground)',
          flexShrink: 0,
        }}
      >
        Aa
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--foreground)',
            marginBottom: '4px',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
            marginBottom: '4px',
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--foreground)',
          }}
        >
          {usage}
        </div>
      </div>
    </div>
  );
}

interface WeightRowProps {
  name: string;
  value: string;
  usage: string;
  weight: string;
  isLast?: boolean;
}

function WeightRow({ name, value, usage, weight, isLast }: WeightRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: 'var(--card)',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '80px',
          fontFamily: 'Calibre, sans-serif',
          fontSize: 'var(--text-base)',
          fontWeight: weight,
          color: 'var(--foreground)',
          flexShrink: 0,
        }}
      >
        Sample
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--foreground)',
            marginBottom: '4px',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
            marginBottom: '4px',
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--foreground)',
          }}
        >
          {usage}
        </div>
      </div>
    </div>
  );
}

interface FontFamilyRowProps {
  name: string;
  usage: string;
  family: string;
  example: string;
  isLast?: boolean;
}

function FontFamilyRow({ name, usage, family, example, isLast }: FontFamilyRowProps) {
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--card)',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
      }}
    >
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--foreground)',
          marginBottom: '8px',
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: 'Calibre, sans-serif',
          fontSize: 'var(--text-sm)',
          color: 'var(--foreground)',
          marginBottom: '12px',
        }}
      >
        {usage}
      </div>
      <div
        style={{
          fontFamily: family,
          fontSize: 'var(--text-xl)',
          color: 'var(--foreground)',
          padding: '12px',
          backgroundColor: 'var(--background)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        {example}
      </div>
    </div>
  );
}

const codeStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 'var(--text-xs)',
  backgroundColor: 'var(--muted)',
  padding: '2px 4px',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--foreground)',
};
