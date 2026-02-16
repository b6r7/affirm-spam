import { useState } from 'react';
import { Locale, localeLabels, LOCALES } from '../data/contentData';

export interface AddTranslationModalProps {
  existingLocales: Locale[];
  onConfirm: (targetLocale: Locale) => void;
  onClose: () => void;
}

export function AddTranslationModal({ existingLocales, onConfirm, onClose }: AddTranslationModalProps) {
  const options = LOCALES.filter((l) => !existingLocales.includes(l));
  const [selectedLocale, setSelectedLocale] = useState<Locale | ''>(options[0] ?? '');

  const handleCreate = () => {
    if (selectedLocale && options.includes(selectedLocale as Locale)) {
      onConfirm(selectedLocale as Locale);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '20px',
          width: '320px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            marginBottom: '12px',
          }}
        >
          Add translation
        </div>
        <p
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
            marginBottom: '12px',
          }}
        >
          Choose a locale to add as a new translation. Content will be copied from the base locale.
        </p>
        <div className="relative mb-4">
          <select
            value={selectedLocale}
            onChange={(e) => setSelectedLocale(e.target.value as Locale | '')}
            className="w-full px-3 py-2.5 border appearance-none pr-10"
            style={{
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-sm)',
              color: 'var(--foreground)',
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            {options.map((loc) => (
              <option key={loc} value={loc}>
                {localeLabels[loc]}
              </option>
            ))}
          </select>
        </div>
        {options.length === 0 && (
          <p
            style={{
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
              marginBottom: '12px',
            }}
          >
            All locales already exist for this template.
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={options.length === 0}
            style={{
              padding: '8px 16px',
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-sm)',
              color: 'white',
              backgroundColor: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: options.length === 0 ? 'not-allowed' : 'pointer',
              opacity: options.length === 0 ? 0.6 : 1,
            }}
          >
            Create translation
          </button>
        </div>
      </div>
    </div>
  );
}
