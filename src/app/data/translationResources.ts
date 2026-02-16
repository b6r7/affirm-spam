import { Locale, Tone, Variant } from './contentData';
import { getSystemEmailContent } from '../i18n/getSystemEmailContent';

/** i18next-style translation keys per locale. */
export type TranslationKey = 
  | 'payment_reminder.greeting'
  | 'payment_reminder.body'
  | 'payment_reminder.warning'
  | 'payment_reminder.cta'
  | 'payment_reminder.footer'
  | 'payment_reminder.legal_text';

export const translationKeys: Record<Variant, Record<Tone, Record<TranslationKey, string>>> = {
  'A': {
    'Supportive': {
      'payment_reminder.greeting': 'Hi {name},',
      'payment_reminder.body': 'We wanted to remind you about your upcoming payment.',
      'payment_reminder.warning': '',
      'payment_reminder.cta': 'Make a payment',
      'payment_reminder.footer': 'We\'re here to help if you need anything.',
      'payment_reminder.legal_text': 'Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.',
    },
    'Neutral': {
      'payment_reminder.greeting': 'Hello {name},',
      'payment_reminder.body': 'Your payment is due soon. Please review and submit your payment.',
      'payment_reminder.warning': '',
      'payment_reminder.cta': 'Make a payment',
      'payment_reminder.footer': '',
      'payment_reminder.legal_text': 'Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.',
    },
    'Firm': {
      'payment_reminder.greeting': 'Hello {name},',
      'payment_reminder.body': 'Your payment is overdue. Submit payment immediately.',
      'payment_reminder.warning': '',
      'payment_reminder.cta': 'Pay now',
      'payment_reminder.footer': '',
      'payment_reminder.legal_text': 'Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.',
    },
    'Educational': {
      'payment_reminder.greeting': 'Hi {name},',
      'payment_reminder.body': 'Your payment helps maintain your loan in good standing. When payments are made on time, it keeps your account active and helps build your payment history.',
      'payment_reminder.warning': '',
      'payment_reminder.cta': 'Make a payment',
      'payment_reminder.footer': 'Questions about your payment? We\'re here to help.',
      'payment_reminder.legal_text': 'Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.',
    },
  },
  'B': {
    'Supportive': {
      'payment_reminder.greeting': 'Hi {name},',
      'payment_reminder.body': 'Just a friendly reminder that you have a payment due soon.',
      'payment_reminder.warning': '',
      'payment_reminder.cta': 'Make a payment',
      'payment_reminder.footer': 'Let us know if you have questions.',
      'payment_reminder.legal_text': 'Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.',
    },
    'Neutral': {
      'payment_reminder.greeting': 'Hello {name},',
      'payment_reminder.body': 'This is a reminder about your upcoming payment. Please complete it at your earliest convenience.',
      'payment_reminder.warning': '',
      'payment_reminder.cta': 'Make a payment',
      'payment_reminder.footer': '',
      'payment_reminder.legal_text': 'Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.',
    },
    'Firm': {
      'payment_reminder.greeting': 'Hello {name},',
      'payment_reminder.body': 'Action required: Complete your overdue payment now.',
      'payment_reminder.warning': '',
      'payment_reminder.cta': 'Pay now',
      'payment_reminder.footer': '',
      'payment_reminder.legal_text': 'Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.',
    },
    'Educational': {
      'payment_reminder.greeting': 'Hi {name},',
      'payment_reminder.body': 'Making your payment on time is important for keeping your account in good standing and maintaining your payment schedule.',
      'payment_reminder.warning': '',
      'payment_reminder.cta': 'Make a payment',
      'payment_reminder.footer': 'Need help understanding your payment? Contact us.',
      'payment_reminder.legal_text': 'Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.',
    },
  },
  'C': {
    'Supportive': {
      'payment_reminder.greeting': 'Hi {name},',
      'payment_reminder.body': 'We\'re reaching out about your payment that\'s coming up.',
      'payment_reminder.warning': '',
      'payment_reminder.cta': 'Make a payment',
      'payment_reminder.footer': 'We\'re always here if you need us.',
      'payment_reminder.legal_text': 'Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.',
    },
    'Neutral': {
      'payment_reminder.greeting': 'Hello {name},',
      'payment_reminder.body': 'You have a payment due. Please process your payment soon.',
      'payment_reminder.warning': '',
      'payment_reminder.cta': 'Make a payment',
      'payment_reminder.footer': '',
      'payment_reminder.legal_text': 'Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.',
    },
    'Firm': {
      'payment_reminder.greeting': 'Hello {name},',
      'payment_reminder.body': 'Payment overdue. Process payment immediately to avoid issues.',
      'payment_reminder.warning': '',
      'payment_reminder.cta': 'Pay now',
      'payment_reminder.footer': '',
      'payment_reminder.legal_text': 'Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.',
    },
    'Educational': {
      'payment_reminder.greeting': 'Hi {name},',
      'payment_reminder.body': 'Regular, on-time payments help you complete your loan successfully and can positively impact your credit profile.',
      'payment_reminder.warning': '',
      'payment_reminder.cta': 'Make a payment',
      'payment_reminder.footer': 'Have questions? We\'re available to help.',
      'payment_reminder.legal_text': 'Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.',
    },
  },
};

export function resolveTranslation(
  key: TranslationKey,
  locale: Locale,
  tone: Tone,
  variant: Variant
): string {
  const content = getSystemEmailContent('payment-reminder', locale, tone, variant);
  switch (key) {
    case 'payment_reminder.greeting':
      return content.greeting;
    case 'payment_reminder.body':
      return content.body;
    case 'payment_reminder.warning':
      return content.warning || '';
    case 'payment_reminder.cta':
      return content.cta;
    case 'payment_reminder.footer':
      return content.footer;
    case 'payment_reminder.legal_text':
      return content.legalText;
    default:
      return '';
  }
}

export function getTranslationKeysWithEnglish(tone: Tone, variant: Variant): Array<{
  key: TranslationKey;
  english: string;
}> {
  const keys = translationKeys[variant][tone];
  return Object.entries(keys)
    .filter(([_, value]) => value !== '')
    .map(([key, english]) => ({
      key: key as TranslationKey,
      english,
    }));
}
