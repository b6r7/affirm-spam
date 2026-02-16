export function HandoffDocumentation() {
  return (
    <div 
      style={{
        backgroundColor: 'var(--background)',
        minHeight: '100vh',
        padding: '48px',
        fontFamily: 'Calibre, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: 'Axiforma, sans-serif',
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--foreground)',
            marginBottom: '8px',
          }}
        >
          Engineering Handoff Map (Figma Plugin)
        </h1>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
            marginBottom: '48px',
          }}
        >
          Affirm SPAM · Structured Payments & Messaging
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
            A) Component-to-UI Map Table
          </h2>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--muted)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <th style={tableHeaderStyle}>Figma Node Name</th>
                  <th style={tableHeaderStyle}>React Component</th>
                  <th style={tableHeaderStyle}>Key Props/State</th>
                  <th style={tableHeaderStyle}>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: 'var(--card)' }}>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>SPAM/Canvas/EmailVariant-A</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>EmailVariant.tsx</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={smallCodeStyle}>
                      locale, tone, content, isSelected, complianceIssues
                    </code>
                  </td>
                  <td style={tableCellStyle}>
                    Production-ready. Renders A/B/C test variants. Hidden in draft mode.
                  </td>
                </tr>

                <tr style={{ backgroundColor: 'var(--background)' }}>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>SPAM/Canvas/EmailVariant-B</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>EmailVariant.tsx</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={smallCodeStyle}>
                      locale, tone, content, isSelected, hasWarning
                    </code>
                  </td>
                  <td style={tableCellStyle}>
                    Production-ready. Shows compliance warnings when applicable.
                  </td>
                </tr>

                <tr style={{ backgroundColor: 'var(--card)' }}>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>SPAM/Canvas/EmailVariant-C</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>EmailVariant.tsx</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={smallCodeStyle}>
                      locale, tone, content, isSelected
                    </code>
                  </td>
                  <td style={tableCellStyle}>Production-ready. Standard variant display.</td>
                </tr>

                <tr style={{ backgroundColor: 'var(--background)' }}>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>SPAM/Canvas/DraftEmailCard</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>DraftEmailCard.tsx</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={smallCodeStyle}>draftText, templateName, locale</code>
                  </td>
                  <td style={tableCellStyle}>
                    <strong>Demo-only.</strong> Shown only in draft-unsaved state. Replace with live
                    preview binding.
                  </td>
                </tr>

                <tr style={{ backgroundColor: 'var(--card)' }}>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>SPAM/Canvas/CompliancePanel</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>CompliancePanel (in App.tsx)</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={smallCodeStyle}>locale, resolvedIssues, setResolvedIssues</code>
                  </td>
                  <td style={tableCellStyle}>
                    Production-ready. Hidden in draft mode. Maps to compliance API response.
                  </td>
                </tr>

                <tr style={{ backgroundColor: 'var(--background)' }}>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>SPAM/Sidebar/CommsForgePanel</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>CommsForgePanel.tsx</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={smallCodeStyle}>
                      locale, tone, selectedVariants, prototypeState, exportState
                    </code>
                  </td>
                  <td style={tableCellStyle}>
                    Production-ready. Main control panel. Always visible, right-aligned.
                  </td>
                </tr>

                <tr style={{ backgroundColor: 'var(--card)' }}>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>SPAM/Sidebar/TemplateSelector</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>TemplateSelector.tsx</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={smallCodeStyle}>
                      selectedTemplate, locale, hasNewTemplate
                    </code>
                  </td>
                  <td style={tableCellStyle}>
                    Production-ready. Dropdown populated from template API. Hidden in draft mode.
                  </td>
                </tr>

                <tr style={{ backgroundColor: 'var(--background)' }}>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>SPAM/Sidebar/TemplateCreationPanel</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>TemplateCreationPanel.tsx</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={smallCodeStyle}>onCancel, onCreate, onDraftTextChange</code>
                  </td>
                  <td style={tableCellStyle}>
                    <strong>Prototype handlers.</strong> Shown only in draft-unsaved state. Replace
                    with real template creation API.
                  </td>
                </tr>

                <tr style={{ backgroundColor: 'var(--card)' }}>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>SPAM/Sidebar/EllipsisMenu</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={codeStyle}>EllipsisMenu.tsx</code>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={smallCodeStyle}>
                      isBaseTemplate, onDuplicate, onRename
                    </code>
                  </td>
                  <td style={tableCellStyle}>
                    Production-ready. Template management actions. Hidden in draft mode.
                  </td>
                </tr>

              </tbody>
            </table>
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
            B) State Model Diagram
          </h2>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              backgroundColor: 'var(--card)',
            }}
          >
            <div
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                marginBottom: '24px',
              }}
            >
              Prototype uses three explicit frame states (non-negotiable):
            </div>

            <StateCard
              stateName="normal"
              description="Default operational state"
              visibleSections={[
                'Canvas: EmailVariant A/B/C (3 cards in grid)',
                'Canvas: CompliancePanel (below cards)',
                'Sidebar: TemplateSelector dropdown',
                'Sidebar: EllipsisMenu',
                'Sidebar: Locale/Tone/Variant selectors',
                'Sidebar: Generate & Export buttons',
              ]}
              hiddenSections={['Canvas: DraftEmailCard', 'Sidebar: TemplateCreationPanel']}
              trigger="Default state"
            />

            <StateCard
              stateName="draft-unsaved"
              description="Creating new template"
              visibleSections={[
                'Canvas: DraftEmailCard (single centered card)',
                'Sidebar: TemplateCreationPanel',
                'Sidebar: "Apply to preview" button',
                'Sidebar: "Load & save template" button',
                'Sidebar: "Cancel" button',
              ]}
              hiddenSections={[
                'Canvas: EmailVariant A/B/C',
                'Canvas: CompliancePanel',
                'Sidebar: TemplateSelector',
                'Sidebar: EllipsisMenu',
                'Sidebar: Generate & Export buttons',
              ]}
              trigger='Click "Add new" button in TemplateSelector section'
            />

            <StateCard
              stateName="saved-new-template"
              description="After saving new template"
              visibleSections={[
                'Canvas: EmailVariant A/B/C (returns to grid)',
                'Canvas: CompliancePanel',
                'Sidebar: TemplateSelector (with new template "HEY HEY WHAT IS UP" selected)',
                'Sidebar: EllipsisMenu',
                'Sidebar: All normal controls',
              ]}
              hiddenSections={['Canvas: DraftEmailCard', 'Sidebar: TemplateCreationPanel']}
              trigger='Click "Load & save template" in draft-unsaved state'
            />

            <div
              style={{
                marginTop: '32px',
                padding: '16px',
                backgroundColor: 'rgba(var(--accent-rgb, 0, 112, 243), 0.05)',
                border: '1px solid rgba(var(--accent-rgb, 0, 112, 243), 0.2)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--foreground)',
                  marginBottom: '8px',
                }}
              >
                State Transitions:
              </div>
              <ul
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                  lineHeight: '1.6',
                  paddingLeft: '20px',
                }}
              >
                <li>
                  <code style={codeStyle}>normal</code> → <code style={codeStyle}>draft-unsaved</code>
                  : Click "Add new"
                </li>
                <li>
                  <code style={codeStyle}>draft-unsaved</code> →{' '}
                  <code style={codeStyle}>saved-new-template</code>: Click "Load & save template"
                </li>
                <li>
                  <code style={codeStyle}>draft-unsaved</code> → <code style={codeStyle}>normal</code>
                  : Click "Cancel"
                </li>
              </ul>
            </div>
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
            C) Node Naming Rules
          </h2>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              backgroundColor: 'var(--card)',
            }}
          >
            <div
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-sm)',
                color: 'var(--foreground)',
                marginBottom: '16px',
              }}
            >
              All major frames and components <strong>must</strong> be renamed with the strict prefix:
            </div>

            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--background)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                marginBottom: '24px',
              }}
            >
              <code
                style={{
                  fontFamily: 'monospace',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--accent)',
                }}
              >
                SPAM/
              </code>
            </div>

            <div
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--foreground)',
                marginBottom: '12px',
              }}
            >
              Naming Examples:
            </div>

            <ul
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-sm)',
                color: 'var(--foreground)',
                lineHeight: '1.8',
                listStyle: 'none',
                padding: 0,
              }}
            >
              <li style={{ marginBottom: '8px' }}>
                <code style={codeStyle}>SPAM/Canvas/EmailVariant-A</code>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <code style={codeStyle}>SPAM/Canvas/EmailVariant-B</code>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <code style={codeStyle}>SPAM/Canvas/EmailVariant-C</code>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <code style={codeStyle}>SPAM/Canvas/DraftEmailCard</code>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <code style={codeStyle}>SPAM/Canvas/CompliancePanel</code>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <code style={codeStyle}>SPAM/Sidebar/TemplateCreationPanel</code>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <code style={codeStyle}>SPAM/Sidebar/TemplateSelector</code>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <code style={codeStyle}>SPAM/Sidebar/EllipsisMenu</code>
              </li>
            </ul>

            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: 'rgba(232, 140, 49, 0.05)',
                border: '1px solid rgba(232, 140, 49, 0.2)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--foreground)',
                  marginBottom: '8px',
                }}
              >
                ⚠️ Critical:
              </div>
              <div
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                  lineHeight: '1.6',
                }}
              >
                Plugin code must query nodes by exact name. Inconsistent naming will break UI binding.
              </div>
            </div>
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
            D) Export Notes for Engineers
          </h2>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              backgroundColor: 'var(--card)',
            }}
          >
            <div
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--foreground)',
                marginBottom: '16px',
              }}
            >
              Implementation Instructions:
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={instructionTitleStyle}>1. Node Name Binding</div>
              <div style={instructionBodyStyle}>
                Use <code style={codeStyle}>SPAM/*</code> node names to bind plugin UI sections. Query
                Figma nodes by exact name match. Do not rely on position or layer order.
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={instructionTitleStyle}>2. Compliance Highlighting</div>
              <div style={instructionBodyStyle}>
                Compliance API returns problematic phrases with character ranges. Map these to text
                spans in <code style={codeStyle}>EmailVariant</code> components. Highlight spans with{' '}
                <code style={codeStyle}>rgba(232, 140, 49, 0.15)</code> background.
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={instructionTitleStyle}>3. Localization Scope</div>
              <div style={instructionBodyStyle}>
                <strong>Admin UI (sidebar controls):</strong> Always English. Labels like "Email
                template", "Target locale", "Generate variants" never translate.
                <br />
                <br />
                <strong>Customer content (email cards):</strong> Fully localized. Driven by{' '}
                <code style={codeStyle}>locale</code> prop. Text binds to translation bundles fetched
                from content API.
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={instructionTitleStyle}>4. State Persistence</div>
              <div style={instructionBodyStyle}>
                <code style={codeStyle}>prototypeState</code> is demo-only. In production, replace with
                actual template creation flow:
                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  <li>Draft mode → POST to <code style={smallCodeStyle}>/api/templates/draft</code></li>
                  <li>
                    Save template → POST to <code style={smallCodeStyle}>/api/templates</code>
                  </li>
                  <li>
                    Template list → GET from <code style={smallCodeStyle}>/api/templates</code>
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={instructionTitleStyle}>5. Export Flow</div>
              <div style={instructionBodyStyle}>
                Export buttons trigger modal confirmation, then POST selected variants to{' '}
                <code style={smallCodeStyle}>/api/exports</code>. Response includes export job ID.
                Poll <code style={smallCodeStyle}>/api/exports/:id</code> for completion. Show
                checkmark on success.
              </div>
            </div>

            <div style={{ marginBottom: '0' }}>
              <div style={instructionTitleStyle}>6. Compliance Integration</div>
              <div style={instructionBodyStyle}>
                On tone or locale change, debounce 500ms then POST current email content to{' '}
                <code style={smallCodeStyle}>/api/compliance/check</code>. Response schema:
                <pre
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--background)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'monospace',
                    color: 'var(--foreground)',
                    overflow: 'auto',
                  }}
                >
                  {`{
  "issues": [
    {
      "phrase": "must pay",
      "level": "High",
      "suggestion": "Use 'please make a payment'",
      "problematicPhrase": "must pay",
      "replacementText": "please make a payment",
      "range": { "start": 42, "end": 50 }
    }
  ]
}`}
                </pre>
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
          Affirm SPAM Engineering Handoff · Last updated February 6, 2026
        </div>
      </div>
    </div>
  );
}

interface StateCardProps {
  stateName: string;
  description: string;
  visibleSections: string[];
  hiddenSections: string[];
  trigger: string;
}

function StateCard({
  stateName,
  description,
  visibleSections,
  hiddenSections,
  trigger,
}: StateCardProps) {
  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '20px',
        backgroundColor: 'var(--background)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <code
          style={{
            fontFamily: 'monospace',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--accent)',
          }}
        >
          {stateName}
        </code>
        <span
          style={{
            marginLeft: '12px',
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
          }}
        >
          {description}
        </span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
          }}
        >
          Visible:
        </div>
        <ul
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'rgba(10, 137, 76, 1)',
            lineHeight: '1.6',
            paddingLeft: '20px',
            margin: 0,
          }}
        >
          {visibleSections.map((section, index) => (
            <li key={index}>{section}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
          }}
        >
          Hidden:
        </div>
        <ul
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
            lineHeight: '1.6',
            paddingLeft: '20px',
            margin: 0,
            textDecoration: 'line-through',
          }}
        >
          {hiddenSections.map((section, index) => (
            <li key={index}>{section}</li>
          ))}
        </ul>
      </div>

      <div
        style={{
          padding: '12px',
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'Calibre, sans-serif',
          fontSize: 'var(--text-sm)',
          color: 'var(--foreground)',
        }}
      >
        <strong>Trigger:</strong> {trigger}
      </div>
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  fontFamily: 'Calibre, sans-serif',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--foreground)',
  textAlign: 'left',
  padding: '12px 16px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tableCellStyle: React.CSSProperties = {
  fontFamily: 'Calibre, sans-serif',
  fontSize: 'var(--text-sm)',
  color: 'var(--foreground)',
  padding: '16px',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'top',
};

const codeStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 'var(--text-sm)',
  backgroundColor: 'var(--muted)',
  padding: '2px 6px',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--accent)',
};

const smallCodeStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 'var(--text-xs)',
  backgroundColor: 'var(--muted)',
  padding: '2px 4px',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--foreground)',
};

const instructionTitleStyle: React.CSSProperties = {
  fontFamily: 'Calibre, sans-serif',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--foreground)',
  marginBottom: '8px',
};

const instructionBodyStyle: React.CSSProperties = {
  fontFamily: 'Calibre, sans-serif',
  fontSize: 'var(--text-sm)',
  color: 'var(--foreground)',
  lineHeight: '1.6',
};
