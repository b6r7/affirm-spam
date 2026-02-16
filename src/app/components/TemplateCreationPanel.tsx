import { useState, useEffect, useRef, useCallback } from 'react';
import { Locale, localeLabels } from '../data/contentData';

export type DraftPayload = { name: string; locale: Locale; text: string };

const DEBOUNCE_MS = 150;

interface TemplateCreationPanelProps {
  onCancel: () => void;
  onSaveTemplate: (payload: DraftPayload) => void;
  onDraftChange: (payload: DraftPayload) => void;
}

const DEFAULT_ENGLISH_TEMPLATE = `Hi {name},

We wanted to remind you about your upcoming payment.

We're here to help if you need anything.`;

const DEMO_TRANSLATIONS: Record<Locale, string> = {
  'en-US': DEFAULT_ENGLISH_TEMPLATE,
  'en-GB': `Hello {name},

We wanted to remind you that your payment is due shortly.

Please do get in touch if you need assistance.`,
  'es-ES': `Hola {name},

Queremos recordarte amablemente que tienes un pago pendiente próximo.

Estamos aquí para ayudarte si lo necesitas.`,
  'es-MX': `Hola {name},

Queremos recordarte que tienes un pago próximo.

Estamos para ayudarte en lo que necesitas.`,
  'pl-PL': `Dzień dobry {name},

Chcielibyśmy przypomnieć o zbliżającej się płatności.

Jesteśmy dostępni, jeśli potrzebujesz pomocy.`,
  'fr-FR': `Bonjour {name},

Nous souhaitons vous rappeler que votre paiement arrive à échéance prochainement.

Nous sommes là pour vous aider si besoin.`,
};

const SOURCE_LOCALE: Locale = 'en-US';

function buildPayload(name: string, locale: Locale, text: string): DraftPayload {
  return {
    name: name || `Payment reminder – ${locale}`,
    locale,
    text,
  };
}

export function TemplateCreationPanel({ onCancel, onSaveTemplate, onDraftChange }: TemplateCreationPanelProps) {
  const [mode, setMode] = useState<'load' | 'override'>('load');
  const [templateName, setTemplateName] = useState('');
  const [targetLocale, setTargetLocale] = useState<Locale>('es-MX');
  const [sourceContent, setSourceContent] = useState(DEFAULT_ENGLISH_TEMPLATE);
  const [translatedContent, setTranslatedContent] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef<string>('');

  const getTextForPreview = useCallback((): string => {
    return mode === 'load' ? DEMO_TRANSLATIONS[targetLocale] : translatedContent;
  }, [mode, targetLocale, translatedContent]);

  const sendDraftUpdate = useCallback(
    (payload: DraftPayload) => {
      const key = `${payload.name}|${payload.locale}|${payload.text}`;
      if (lastSentRef.current === key) return;
      lastSentRef.current = key;
      onDraftChange(payload);
    },
    [onDraftChange]
  );

  const scheduleDebouncedDraft = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      const text = getTextForPreview();
      sendDraftUpdate(buildPayload(templateName, targetLocale, text));
    }, DEBOUNCE_MS);
  }, [templateName, targetLocale, getTextForPreview, sendDraftUpdate]);

  useEffect(() => {
    scheduleDebouncedDraft();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [templateName, targetLocale, mode, translatedContent, scheduleDebouncedDraft]);

  useEffect(() => {
    const text = mode === 'load' ? DEMO_TRANSLATIONS[targetLocale] : translatedContent;
    sendDraftUpdate(buildPayload(templateName, targetLocale, text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyToPreview = () => {
    const textToPreview = getTextForPreview();
    onDraftChange(buildPayload(templateName, targetLocale, textToPreview));
  };

  const handleSave = () => {
    if (mode === 'load') {
      const textToSave = DEMO_TRANSLATIONS[targetLocale];
      onSaveTemplate(buildPayload(templateName, targetLocale, textToSave));
    } else {
      onSaveTemplate(buildPayload(templateName, targetLocale, translatedContent));
    }
  };

  const getPlaceholder = (locale: Locale): string => {
    const placeholders: Record<Locale, string> = {
      'en-US': 'Enter English copy...',
      'en-GB': 'Enter English copy...',
      'es-ES': 'Ingresa el texto en español...',
      'es-MX': 'Ingresa el texto en español...',
      'pl-PL': 'Wprowadź tekst po polsku...',
      'fr-FR': 'Entrez le texte en français...',
    };
    return placeholders[locale];
  };

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        minWidth: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontFamily: 'Axiforma, sans-serif',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--foreground)',
          marginBottom: '16px',
        }}
      >
        Create new template
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '4px',
            backgroundColor: 'var(--background)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}
        >
          <button
            onClick={() => setMode('load')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: mode === 'load' ? 'var(--foreground)' : 'var(--muted-foreground)',
              backgroundColor: mode === 'load' ? 'var(--card)' : 'transparent',
              border: mode === 'load' ? '1px solid var(--border)' : '1px solid transparent',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Load from locale resources
          </button>
          <button
            onClick={() => setMode('override')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: mode === 'override' ? 'var(--foreground)' : 'var(--muted-foreground)',
              backgroundColor: mode === 'override' ? 'var(--card)' : 'transparent',
              border: mode === 'override' ? '1px solid var(--border)' : '1px solid transparent',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Override locale copy
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--foreground)',
            marginBottom: '8px',
          }}
        >
          Template name
        </label>
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Payment reminder – MX"
          style={{
            width: '100%',
            padding: '8px 12px',
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--foreground)',
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--foreground)',
            marginBottom: '8px',
          }}
        >
          Target locale
        </label>
        <select
          value={targetLocale}
          onChange={(e) => setTargetLocale(e.target.value as Locale)}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--foreground)',
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="es-MX">{localeLabels['es-MX']}</option>
          <option value="es-ES">{localeLabels['es-ES']}</option>
          <option value="pl-PL">{localeLabels['pl-PL']}</option>
          <option value="en-GB">{localeLabels['en-GB']}</option>
          <option value="fr-FR">{localeLabels['fr-FR']}</option>
        </select>
      </div>

      {mode === 'load' && (
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--foreground)',
              marginBottom: '8px',
            }}
          >
            Source template (English)
          </label>
          <textarea
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            rows={6}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-sm)',
              color: 'var(--foreground)',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              outline: 'none',
              resize: 'vertical',
            }}
          />
          <div
            style={{
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
              marginTop: '8px',
            }}
          >
            Translations use locale resource files.
          </div>
        </div>
      )}

      {mode === 'override' && (
        <>
          <div
            style={{
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
              marginBottom: '12px',
            }}
          >
            Edit localized values while keeping translation keys unchanged.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--foreground)',
                  marginBottom: '8px',
                }}
              >
                Source (English)
              </label>
              <textarea
                value={DEFAULT_ENGLISH_TEMPLATE}
                readOnly
                rows={6}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--foreground)',
                  marginBottom: '8px',
                }}
              >
                Localized copy
              </label>
              <textarea
                value={translatedContent}
                onChange={(e) => setTranslatedContent(e.target.value)}
                placeholder={getPlaceholder(targetLocale)}
                rows={6}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </>
      )}

      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={handleApplyToPreview}
          disabled={mode === 'override' && !translatedContent}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: mode === 'override' && !translatedContent ? 'var(--muted-foreground)' : 'var(--muted-foreground)',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: mode === 'override' && !translatedContent ? 'not-allowed' : 'pointer',
            textDecoration: 'underline',
            textAlign: 'left',
            opacity: mode === 'override' && !translatedContent ? 0.5 : 1,
          }}
        >
          Refresh preview (optional)
        </button>
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
            marginTop: '4px',
          }}
        >
          Preview updates as you type. Use the button above to sync after auto-translate.
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 16px',
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--muted-foreground)',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-button)',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={mode === 'override' && !translatedContent}
          style={{
            padding: '10px 16px',
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'white',
            backgroundColor: mode === 'override' && !translatedContent ? 'var(--muted)' : 'var(--accent)',
            border: 'none',
            borderRadius: 'var(--radius-button)',
            cursor: mode === 'override' && !translatedContent ? 'not-allowed' : 'pointer',
            opacity: mode === 'override' && !translatedContent ? 0.5 : 1,
          }}
        >
          {mode === 'load' ? 'Load & save template' : 'Save locale override'}
        </button>
      </div>
    </div>
  );
}
