import type { Locale } from '../messageTypes';

export interface ComplianceIssue {
  phrase: string;
  level: 'Low' | 'Medium';
  suggestion: string;
  problematicPhrase: string;
  replacementText: string;
}

/** Compliance rules per locale (from contentData; used for seed/defaults and reference). */
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
