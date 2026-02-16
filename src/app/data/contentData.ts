export type Locale = 'en-US' | 'en-GB' | 'es-ES' | 'es-MX' | 'pl-PL' | 'fr-FR';
export const LOCALES: Locale[] = ['en-US', 'en-GB', 'es-ES', 'es-MX', 'pl-PL', 'fr-FR'];
export type Tone = 'Supportive' | 'Neutral' | 'Firm' | 'Educational';
export type Variant = 'A' | 'B' | 'C';

export interface EmailContent {
  /** Per-locale bold title (e.g. from email.title in import). Falls back to template name when absent. */
  title?: string;
  greeting: string;
  body: string;
  warning?: string;
  cta: string;
  footer: string;
  legalText: string;
}

export interface ComplianceIssue {
  phrase: string;
  level: 'Low' | 'Medium';
  suggestion: string;
  problematicPhrase: string;
  replacementText: string;
}

export const localeLabels: Record<Locale, string> = {
  'en-US': 'English (United States)',
  'en-GB': 'English (United Kingdom)',
  'es-ES': 'Spanish (Spain)',
  'es-MX': 'Spanish (Mexico)',
  'pl-PL': 'Polish',
  'fr-FR': 'French (France)',
};

export const localeMetadata: Record<Locale, string> = {
  'en-US': 'EN-US',
  'en-GB': 'EN-GB',
  'es-ES': 'ES-ES',
  'es-MX': 'ES-MX',
  'pl-PL': 'PL',
  'fr-FR': 'FR-FR',
};

export const complianceRules: Record<Locale, ComplianceIssue[]> = {
  'en-US': [],
  'en-GB': [
    {
      phrase: 'Phrase "must" flagged for UK',
      level: 'Low',
      suggestion: 'Use "please" or "should" for softer tone.',
      problematicPhrase: 'must',
      replacementText: 'please',
    },
  ],
  'es-ES': [
    {
      phrase: 'Phrase "Debes pagar" flagged for Spain',
      level: 'Medium',
      suggestion: 'Use "Realiza tu pago" instead.',
      problematicPhrase: 'Debes pagar',
      replacementText: 'Realiza tu pago',
    },
  ],
  'es-MX': [
    {
      phrase: 'Phrase "Necesitas pagar" flagged for Mexico',
      level: 'Medium',
      suggestion: 'Use "Te pedimos realizar tu pago" instead.',
      problematicPhrase: 'Necesitas pagar',
      replacementText: 'Te pedimos realizar tu pago',
    },
  ],
  'pl-PL': [],
  'fr-FR': [],
};
