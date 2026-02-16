/**
 * Export format identical to plugin: same keys, order, whitespace (JSON.stringify(payload, null, 2)).
 * Single locale = one JSON file; multiple locales = ZIP with one JSON per locale.
 */

import type { EmailContent } from '../data/contentData';
import type { Locale } from '../data/contentData';
import type { Variant, Tone, LayoutMode } from 'figma-plugin/messageTypes';
import { RECOMMENDED_VARIANT } from 'figma-plugin/messageTypes';
import JSZip from 'jszip';

/** Plugin-identical: variant shape for export (stable key order). */
export function contentToExportVariant(c: EmailContent): Record<string, string> {
  const out: Record<string, string> = {
    greeting: c.greeting ?? '',
    body: c.body ?? '',
    footer: c.footer ?? '',
    cta: c.cta ?? '',
    legalText: c.legalText ?? '',
  };
  if (c.warning != null && c.warning !== '') out.warning = c.warning;
  return out;
}

export interface ExportTemplateMeta {
  id: string;
  name: string;
  intent: string;
  isCustom: boolean;
  isDeprecated: boolean;
}

/** Build payload in plugin-identical key order for deterministic JSON. */
export function buildExportPayload(params: {
  template: ExportTemplateMeta;
  locale: Locale;
  tone: Tone;
  layoutMode: LayoutMode;
  variants: Record<Variant, EmailContent>;
}): Record<string, unknown> {
  const { template, locale, tone, layoutMode, variants } = params;
  return {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    template: {
      id: template.id,
      name: template.name,
      intent: template.intent,
      isCustom: template.isCustom,
      isDeprecated: template.isDeprecated,
    },
    context: {
      locale,
      tone,
      layoutMode,
      recommendedVariant: RECOMMENDED_VARIANT,
    },
    variants: {
      A: contentToExportVariant(variants.A),
      B: contentToExportVariant(variants.B),
      C: contentToExportVariant(variants.C),
    },
  };
}

/** Deterministic stringify matching plugin (2-space indent). */
export function stringifyExportPayload(payload: Record<string, unknown>): string {
  return JSON.stringify(payload, null, 2);
}

/** Export date segment for filenames: YYYY-MM-DD_HH-mm-ss */
export function exportDateSegment(): string {
  const d = new Date();
  const iso = d.toISOString();
  return iso.slice(0, 10) + '_' + iso.slice(11, 19).replace(/:/g, '-');
}

export function triggerJsonDownload(filename: string, jsonString: string): void {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** One locale: single JSON file. Filename pattern matches plugin style. */
export function exportSingleLocale(params: {
  templateId: string;
  locale: Locale;
  tone: Tone;
  layoutMode: LayoutMode;
  template: ExportTemplateMeta;
  variants: Record<Variant, EmailContent>;
  suffix?: string;
}): void {
  const payload = buildExportPayload({
    template: params.template,
    locale: params.locale,
    tone: params.tone,
    layoutMode: params.layoutMode,
    variants: params.variants,
  });
  const suffix = params.suffix ?? exportDateSegment();
  const filename = `email_template.${params.locale}.json`;
  triggerJsonDownload(filename, stringifyExportPayload(payload));
}

/** Multiple locales: ZIP with one JSON per locale. Filename: email_template.<locale>.json */
export async function exportZipPerLocale(params: {
  templateId: string;
  tone: Tone;
  layoutMode: LayoutMode;
  template: ExportTemplateMeta;
  localeVariants: Array<{ locale: Locale; variants: Record<Variant, EmailContent> }>;
}): Promise<void> {
  const zip = new JSZip();
  for (const { locale, variants } of params.localeVariants) {
    const payload = buildExportPayload({
      template: params.template,
      locale,
      tone: params.tone,
      layoutMode: params.layoutMode,
      variants,
    });
    const name = `email_template.${locale}.json`;
    zip.file(name, stringifyExportPayload(payload));
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `affirm-spam__${params.templateId}__${exportDateSegment()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
