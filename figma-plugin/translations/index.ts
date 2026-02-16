/**
 * Static template dictionaries and getSystemEmailContent for plugin runtime.
 * No i18next dependency; admin UI labels stay in English.
 */

import type { EmailContent, Locale, Tone, Variant } from '../messageTypes';
import type { VariantContent } from './en-US';
import { paymentReminder as enUS } from './en-US';
import { paymentReminder as enGB } from './en-GB';
import { paymentReminder as esES } from './es-ES';
import { paymentReminder as esMX } from './es-MX';
import { paymentReminder as plPL } from './pl-PL';
import { paymentReminder as frFR } from './fr-FR';

const byLocale: Record<Locale, Record<Tone, Record<Variant, VariantContent>>> = {
  'en-US': enUS,
  'en-GB': enGB,
  'es-ES': esES,
  'es-MX': esMX,
  'pl-PL': plPL,
  'fr-FR': frFR,
};

function toEmailContent(v: VariantContent): EmailContent {
  return {
    greeting: v.greeting,
    body: v.body,
    footer: v.footer,
    cta: v.cta,
    legalText: v.legalText,
    ...(v.warning !== undefined && v.warning !== '' ? { warning: v.warning } : {}),
  };
}

export interface GetSystemEmailContentParams {
  templateId: string;
  locale: Locale;
  tone: Tone;
  variant: Variant;
}

/**
 * Returns system email content for the given template/locale/tone/variant.
 * Custom or unknown templateIds fall back to payment-reminder content.
 */
export function getSystemEmailContent(params: GetSystemEmailContentParams): EmailContent {
  const { locale, tone, variant } = params;
  const localeMap = byLocale[locale];
  const toneMap = localeMap && localeMap[tone];
  const content = toneMap && toneMap[variant];
  if (!content) {
    return toEmailContent(enUS[tone][variant]);
  }
  return toEmailContent(content);
}

export type { VariantContent, TemplateContentMap } from './en-US';
