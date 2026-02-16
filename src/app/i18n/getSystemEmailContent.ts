import i18n from './config';
import type { Locale, Tone, Variant } from '../data/contentData';
import type { EmailContent } from '../data/contentData';
import { isCustomTemplateId } from '../data/templateData';

const FALLBACK_TEMPLATE_ID = 'payment-reminder';
/** Demo template (seeded for web app first load) uses payment-reminder content. */
const DEMO_TEMPLATE_ID = 'demo';

function t(key: string, lng: Locale): string {
  const v = i18n.t(key, { lng, defaultValue: '' });
  return typeof v === 'string' ? v : '';
}

/** System template content from i18n; keys templates.{id}.{tone}.{variant}.{field}. Falls back to payment-reminder. */
export function getSystemEmailContent(
  templateId: string,
  locale: Locale,
  tone: Tone,
  variant: Variant
): EmailContent {
  let baseId = templateId && !isCustomTemplateId(templateId) ? templateId : FALLBACK_TEMPLATE_ID;
  if (baseId === DEMO_TEMPLATE_ID) baseId = FALLBACK_TEMPLATE_ID;
  const ns = 'templates';
  const prefix = `${ns}.${baseId}.${tone}.${variant}`;
  return {
    greeting: t(`${prefix}.greeting`, locale),
    body: t(`${prefix}.body`, locale),
    footer: t(`${prefix}.footer`, locale),
    cta: t(`${prefix}.cta`, locale),
    legalText: t(`${prefix}.legalText`, locale),
    warning: t(`${prefix}.warning`, locale) || undefined,
  };
}
