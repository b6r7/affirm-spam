import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Locale } from '../data/contentData';
import type { TemplateType, TemplateInfo } from '../data/templateData';
import { isCustomTemplateId } from '../data/templateData';

interface TemplateSelectorProps {
  templates: TemplateInfo[];
  selectedTemplate: TemplateType;
  locale: Locale;
  hasNewTemplate: boolean;
  onTemplateChange: (templateId: TemplateType) => void;
}

function safeTemplateName(template: TemplateInfo | undefined, locale: Locale): string {
  if (!template?.name || typeof template.name !== 'object') return 'Unknown template';
  const name = template.name as Partial<Record<Locale, string>>;
  return name[locale] ?? name['en-US'] ?? 'Unknown template';
}

function safeTemplateDescription(template: TemplateInfo | undefined, locale: Locale): string {
  if (!template?.description || typeof template.description !== 'object') return '';
  const desc = template.description as Partial<Record<Locale, string>>;
  return desc[locale] ?? desc['en-US'] ?? '';
}

export function TemplateSelector({ templates, selectedTemplate, locale, hasNewTemplate, onTemplateChange }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTemplateInfo = templates.find((t) => t.id === selectedTemplate);
  // Sidebar always shows template name in English (admin/list view); preview and Figma insert use locale.
  const templateName = selectedTemplateInfo
    ? safeTemplateName(selectedTemplateInfo, 'en-US')
    : 'Unknown template';

  const visibleTemplates = templates;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group"
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            fontFamily: 'Axiforma for Affirm, sans-serif',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--foreground)',
            lineHeight: 1.2,
          }}
        >
          {templateName}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--muted-foreground)',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 border"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius)',
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
          }}
        >
          <div
            className="px-3 py-2 border-b"
            style={{
              borderColor: 'var(--border)',
            }}
          >
            <div
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Select template
            </div>
          </div>

          {visibleTemplates.map((template) => {
            const displayName = template ? safeTemplateName(template, 'en-US') : '';
            const description = safeTemplateDescription(template, locale);
            const templateId = template?.id;
            const isSelected = templateId === selectedTemplate;
            return (
              <button
                key={templateId ?? Math.random()}
                onClick={() => {
                  if (typeof templateId === 'string') {
                    onTemplateChange(templateId);
                    setIsOpen(false);
                  }
                }}
                className="w-full px-3 py-2.5 flex flex-col gap-1 text-left hover:bg-opacity-50"
                style={{
                  backgroundColor: isSelected ? 'var(--muted)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)',
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  {description}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
