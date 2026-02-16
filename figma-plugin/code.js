var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __restKey = (key) => typeof key === "symbol" ? key : key + "";
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};

// figma-plugin/messageTypes.ts
var RECOMMENDED_VARIANT = "B";

// figma-plugin/data/systemTemplates.ts
var LOCALES = ["en-US", "en-GB", "es-ES", "es-MX", "pl-PL", "fr-FR"];
function emptyResolvedCompliance() {
  const o = {};
  LOCALES.forEach((l) => o[l] = []);
  return o;
}
var EMPTY_TEMPLATE_CATALOG = [];
var DEFAULT_APP_STATE = {
  locale: "en-US",
  tone: "Neutral",
  layoutMode: "affirm",
  previewDevice: "desktop",
  selectedVariants: ["B"],
  selectedTemplateId: "",
  isBaseTemplate: false,
  isDeprecated: false,
  prototypeState: "normal",
  draftName: "",
  draftLocale: "en-US",
  draftText: "",
  isDraftDirty: false,
  templateCatalog: EMPTY_TEMPLATE_CATALOG,
  customTemplatesContent: {},
  resolvedComplianceIssues: emptyResolvedCompliance(),
  exportState: "idle",
  isGenerating: false,
  ui: { isLocaleSelectorDisabled: false },
  templates: {},
  syncMeta: void 0,
  settings: { autoSyncToFile: false }
};

// figma-plugin/storage.ts
var STORAGE_KEY = "affirm_spam_state_v1";
var schemaVersion = 1;
var LOCALE_LOCK_REASON = "Locale is locked for custom templates. Create a translation to add another locale.";
function isCustomTemplateId(templateId) {
  return templateId != null && String(templateId).startsWith("custom-");
}
function computeUi(selectedTemplateId, prototypeState) {
  const isDraftMode = prototypeState === "draft-unsaved";
  if (isDraftMode) {
    return { isLocaleSelectorDisabled: false };
  }
  const isCustom = isCustomTemplateId(selectedTemplateId);
  return {
    isLocaleSelectorDisabled: isCustom,
    localeLockReason: isCustom ? LOCALE_LOCK_REASON : void 0
  };
}
var LOCALES2 = ["en-US", "en-GB", "es-ES", "es-MX", "pl-PL", "fr-FR"];
function normalizeCustomTemplateContent(raw) {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw;
  if (o.baseLocale != null && o.locales != null && typeof o.locales === "object" && !Array.isArray(o.locales)) {
    const baseLocale = o.baseLocale;
    const locales2 = o.locales;
    if (!LOCALES2.includes(baseLocale)) return null;
    return { baseLocale, locales: locales2 };
  }
  const legacyLocale = o.locale;
  const legacyTone = o.tone;
  const legacyVariants = o.variants;
  const byLocale2 = o.byLocale;
  if (legacyLocale == null || !LOCALES2.includes(legacyLocale) || !legacyVariants || typeof legacyVariants !== "object") return null;
  const baseTone = legacyTone != null ? legacyTone : "Neutral";
  const base = {
    tone: baseTone,
    variants: legacyVariants,
    status: "custom"
  };
  const locales = { [legacyLocale]: base };
  if (byLocale2 && typeof byLocale2 === "object") {
    for (const loc of Object.keys(byLocale2)) {
      if (!LOCALES2.includes(loc)) continue;
      const entry = byLocale2[loc];
      if (entry && entry.variants && typeof entry.variants === "object") {
        locales[loc] = { tone: baseTone, variants: entry.variants, status: "custom" };
      }
    }
  }
  return { baseLocale: legacyLocale, locales };
}
function migrateCustomTemplatesContent(raw) {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};
  for (const [id, val] of Object.entries(raw)) {
    const normalized = normalizeCustomTemplateContent(val);
    if (normalized) out[id] = normalized;
  }
  return out;
}
function emptyResolved() {
  const o = {};
  LOCALES2.forEach((l) => o[l] = []);
  return o;
}
function getDefaultPersisted() {
  return {
    schemaVersion,
    locale: DEFAULT_APP_STATE.locale,
    tone: DEFAULT_APP_STATE.tone,
    layoutMode: DEFAULT_APP_STATE.layoutMode,
    previewDevice: DEFAULT_APP_STATE.previewDevice,
    selectedVariants: [...DEFAULT_APP_STATE.selectedVariants],
    selectedTemplateId: DEFAULT_APP_STATE.selectedTemplateId,
    isBaseTemplate: DEFAULT_APP_STATE.isBaseTemplate,
    isDeprecated: DEFAULT_APP_STATE.isDeprecated,
    prototypeState: DEFAULT_APP_STATE.prototypeState,
    draftName: DEFAULT_APP_STATE.draftName,
    draftLocale: DEFAULT_APP_STATE.draftLocale,
    draftText: DEFAULT_APP_STATE.draftText,
    isDraftDirty: DEFAULT_APP_STATE.isDraftDirty,
    templateCatalog: DEFAULT_APP_STATE.templateCatalog,
    customTemplatesContent: {},
    resolvedComplianceIssues: emptyResolved(),
    templates: {},
    generated: void 0,
    syncMeta: void 0,
    settings: { autoSyncToFile: false }
  };
}
function getDefaultState() {
  var _a;
  const p = getDefaultPersisted();
  return __spreadProps(__spreadValues({}, p), {
    exportState: "idle",
    isGenerating: false,
    generated: (_a = p.generated) != null ? _a : void 0,
    ui: computeUi(p.selectedTemplateId, p.prototypeState),
    templates: p.templates != null ? p.templates : {}
  });
}
function migrate(old) {
  const def = getDefaultPersisted();
  if (old == null || typeof old !== "object") {
    return def;
  }
  const o = old;
  if (o.schemaVersion !== schemaVersion) {
    return def;
  }
  const rawGen = o.generated;
  const generated = rawGen != null && typeof rawGen === "object" && typeof rawGen.templateId === "string" && typeof rawGen.signature === "string" && typeof rawGen.generatedAt === "number" ? rawGen : def.generated;
  return {
    schemaVersion,
    locale: typeof o.locale === "string" && LOCALES2.includes(o.locale) ? o.locale : def.locale,
    tone: typeof o.tone === "string" && ["Supportive", "Neutral", "Firm", "Educational"].includes(o.tone) ? o.tone : def.tone,
    layoutMode: typeof o.layoutMode === "string" && (o.layoutMode === "affirm" || o.layoutMode === "spi") ? o.layoutMode : def.layoutMode,
    previewDevice: typeof o.previewDevice === "string" && (o.previewDevice === "mobile" || o.previewDevice === "desktop") ? o.previewDevice : def.previewDevice,
    selectedVariants: Array.isArray(o.selectedVariants) ? o.selectedVariants : def.selectedVariants,
    selectedTemplateId: Array.isArray(o.templateCatalog) && o.templateCatalog.length === 0 ? "" : typeof o.selectedTemplateId === "string" ? o.selectedTemplateId : def.selectedTemplateId,
    isBaseTemplate: typeof o.isBaseTemplate === "boolean" ? o.isBaseTemplate : def.isBaseTemplate,
    isDeprecated: typeof o.isDeprecated === "boolean" ? o.isDeprecated : def.isDeprecated,
    prototypeState: typeof o.prototypeState === "string" && ["normal", "draft-unsaved", "saved-new-template"].includes(o.prototypeState) ? o.prototypeState : def.prototypeState,
    draftName: typeof o.draftName === "string" ? o.draftName : def.draftName,
    draftLocale: typeof o.draftLocale === "string" && LOCALES2.includes(o.draftLocale) ? o.draftLocale : def.draftLocale,
    draftText: typeof o.draftText === "string" ? o.draftText : def.draftText,
    isDraftDirty: typeof o.isDraftDirty === "boolean" ? o.isDraftDirty : def.isDraftDirty,
    templateCatalog: Array.isArray(o.templateCatalog) ? o.templateCatalog : def.templateCatalog,
    customTemplatesContent: migrateCustomTemplatesContent(o.customTemplatesContent),
    resolvedComplianceIssues: o.resolvedComplianceIssues != null && typeof o.resolvedComplianceIssues === "object" && !Array.isArray(o.resolvedComplianceIssues) ? o.resolvedComplianceIssues : def.resolvedComplianceIssues,
    templates: o.templates != null && typeof o.templates === "object" && !Array.isArray(o.templates) ? o.templates : def.templates,
    generated,
    syncMeta: o.syncMeta != null && typeof o.syncMeta === "object" && typeof o.syncMeta.lastSyncedAt === "string" ? o.syncMeta : def.syncMeta
  };
}
async function loadState() {
  var _a;
  try {
    const raw = await figma.clientStorage.getAsync(STORAGE_KEY);
    if (raw === void 0) {
      return getDefaultState();
    }
    const persisted = migrate(raw);
    return __spreadProps(__spreadValues({}, persisted), {
      exportState: "idle",
      isGenerating: false,
      generated: (_a = persisted.generated) != null ? _a : void 0,
      ui: computeUi(persisted.selectedTemplateId, persisted.prototypeState),
      templates: persisted.templates != null ? persisted.templates : {},
      syncMeta: persisted.syncMeta,
      settings: persisted.settings
    });
  } catch (e) {
    return getDefaultState();
  }
}
async function saveState(state2) {
  var _a;
  try {
    const persisted = {
      schemaVersion,
      locale: state2.locale,
      tone: state2.tone,
      layoutMode: state2.layoutMode,
      previewDevice: state2.previewDevice,
      selectedVariants: state2.selectedVariants,
      selectedTemplateId: state2.selectedTemplateId,
      isBaseTemplate: state2.isBaseTemplate,
      isDeprecated: state2.isDeprecated,
      prototypeState: state2.prototypeState,
      draftName: state2.draftName,
      draftLocale: state2.draftLocale,
      draftText: state2.draftText,
      isDraftDirty: state2.isDraftDirty,
      templateCatalog: state2.templateCatalog,
      customTemplatesContent: state2.customTemplatesContent,
      resolvedComplianceIssues: state2.resolvedComplianceIssues,
      templates: state2.templates,
      generated: (_a = state2.generated) != null ? _a : void 0,
      syncMeta: state2.syncMeta,
      settings: state2.settings
    };
    await figma.clientStorage.setAsync(STORAGE_KEY, persisted);
  } catch (e) {
  }
}

// figma-plugin/libraryHash.ts
function sortKeys(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortKeys);
  const o = obj;
  const keys = Object.keys(o).sort();
  const out = {};
  for (const k of keys) out[k] = sortKeys(o[k]);
  return out;
}
function hashString(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h << 5) + h + s.charCodeAt(i);
  return (h >>> 0).toString(36);
}
function computeLibraryHash(templates, customTemplatesContent) {
  const canonical = sortKeys({ templates, customTemplatesContent });
  const json = JSON.stringify(canonical);
  return hashString(json);
}

// figma-plugin/emailLayout.ts
var AFFIRM_BLUE_PRIMARY_HEX = "#4A4AF4";
var AFFIRM_BLUE_PRIMARY_RGB = { r: 74 / 255, g: 74 / 255, b: 244 / 255 };
var HEADER_HEIGHT_AFFIRM = 89;
var LAYOUT_OUTER_PADDING = 24;
var LAYOUT_SECTION_GAP = 16;
var FONT_FAMILY = "Inter";
var AFFIRM_SPEC = {
  cardWidthDesktop: 420,
  cardWidthMobile: 360,
  padding: LAYOUT_OUTER_PADDING,
  itemSpacing: LAYOUT_SECTION_GAP,
  cornerRadius: 12,
  headerHeightAffirm: HEADER_HEIGHT_AFFIRM,
  fill: { r: 0.98, g: 0.98, b: 0.98 },
  stroke: { r: 0.88, g: 0.88, b: 0.88 },
  headingFontSize: 20,
  headingLineHeight: 28,
  headingFontWeight: "semibold",
  bodyFontSize: 15,
  bodyLineHeight: 22,
  legalFontSize: 12,
  legalLineHeight: 18,
  ctaFontSize: 14,
  ctaFontWeight: "semibold",
  ctaHeight: 40,
  ctaCornerRadius: 8,
  heroHeight: 0,
  sectionSpacingExtra: 0
};
var SPI_SPEC = {
  cardWidthDesktop: 420,
  cardWidthMobile: 360,
  padding: LAYOUT_OUTER_PADDING,
  itemSpacing: LAYOUT_SECTION_GAP,
  cornerRadius: 16,
  headerHeightAffirm: 0,
  fill: { r: 1, g: 1, b: 1 },
  stroke: { r: 0.9, g: 0.9, b: 0.9 },
  headingFontSize: 22,
  headingLineHeight: 30,
  headingFontWeight: "semibold",
  bodyFontSize: 16,
  bodyLineHeight: 24,
  legalFontSize: 12,
  legalLineHeight: 18,
  ctaFontSize: 15,
  ctaFontWeight: "semibold",
  ctaHeight: 44,
  ctaCornerRadius: 12,
  heroHeight: 180,
  sectionSpacingExtra: 6
};
function getEmailLayoutSpec(mode) {
  return mode === "spi" ? __spreadValues({}, SPI_SPEC) : __spreadValues({}, AFFIRM_SPEC);
}
var EMAIL_LAYOUT_FONT_FAMILY = FONT_FAMILY;
var PREVIEW_DEVICE_WIDTHS = { mobile: 360, desktop: 640 };

// figma-plugin/translations/en-US.ts
var paymentReminder = {
  Supportive: {
    A: {
      greeting: "Hi {name},",
      body: "We wanted to remind you about your upcoming payment.",
      footer: "We're here to help if you need anything.",
      cta: "Make a payment",
      legalText: "Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.",
      warning: ""
    },
    B: {
      greeting: "Hi {name},",
      body: "Just a friendly reminder that you have a payment due soon.",
      footer: "Let us know if you have questions.",
      cta: "Make a payment",
      legalText: "Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.",
      warning: ""
    },
    C: {
      greeting: "Hi {name},",
      body: "We're reaching out about your payment that's coming up.",
      footer: "We're always here if you need us.",
      cta: "Make a payment",
      legalText: "Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.",
      warning: ""
    }
  },
  Neutral: {
    A: {
      greeting: "Hello {name},",
      body: "Your payment is due soon. Please review and submit your payment.",
      footer: "",
      cta: "Make a payment",
      legalText: "Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.",
      warning: ""
    },
    B: {
      greeting: "Hello {name},",
      body: "This is a reminder about your upcoming payment. Please complete it at your earliest convenience.",
      footer: "",
      cta: "Make a payment",
      legalText: "Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.",
      warning: ""
    },
    C: {
      greeting: "Hello {name},",
      body: "You have a payment due. Please process your payment soon.",
      footer: "",
      cta: "Make a payment",
      legalText: "Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.",
      warning: ""
    }
  },
  Firm: {
    A: {
      greeting: "Hello {name},",
      body: "Your payment is overdue. Submit payment immediately.",
      footer: "",
      cta: "Pay now",
      legalText: "Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.",
      warning: ""
    },
    B: {
      greeting: "Hello {name},",
      body: "Action required: Complete your overdue payment now.",
      footer: "",
      cta: "Pay now",
      legalText: "Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.",
      warning: ""
    },
    C: {
      greeting: "Hello {name},",
      body: "Payment overdue. Process payment immediately to avoid issues.",
      footer: "",
      cta: "Pay now",
      legalText: "Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.",
      warning: ""
    }
  },
  Educational: {
    A: {
      greeting: "Hi {name},",
      body: "Your payment helps maintain your loan in good standing. When payments are made on time, it keeps your account active and helps build your payment history.",
      footer: "Questions about your payment? We're here to help.",
      cta: "Make a payment",
      legalText: "Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.",
      warning: ""
    },
    B: {
      greeting: "Hi {name},",
      body: "Making your payment on time is important for keeping your account in good standing and maintaining your payment schedule.",
      footer: "Need help understanding your payment? Contact us.",
      cta: "Make a payment",
      legalText: "Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.",
      warning: ""
    },
    C: {
      greeting: "Hi {name},",
      body: "Regular, on-time payments help you complete your loan successfully and can positively impact your credit profile.",
      footer: "Have questions? We're available to help.",
      cta: "Make a payment",
      legalText: "Loans made or arranged pursuant to a California Financing Law license. Affirm Loan Services, LLC, NMLS ID 1479506.",
      warning: ""
    }
  }
};

// figma-plugin/translations/en-GB.ts
var paymentReminder2 = {
  Supportive: {
    A: {
      greeting: "Hello {name},",
      body: "We wanted to remind you that your payment is due shortly.",
      footer: "Please do get in touch if you need assistance.",
      cta: "Make a payment",
      legalText: "Affirm Loan Services, LLC operates in accordance with applicable UK consumer credit regulations.",
      warning: ""
    },
    B: {
      greeting: "Hello {name},",
      body: "Just a gentle reminder about your upcoming payment.",
      footer: "We're here to help should you need us.",
      cta: "Make a payment",
      legalText: "Affirm Loan Services, LLC operates in accordance with applicable UK consumer credit regulations.",
      warning: ""
    },
    C: {
      greeting: "Hello {name},",
      body: "We're writing to remind you about your payment that's due soon.",
      footer: "Do let us know if you have any questions.",
      cta: "Make a payment",
      legalText: "Affirm Loan Services, LLC operates in accordance with applicable UK consumer credit regulations.",
      warning: ""
    }
  },
  Neutral: {
    A: {
      greeting: "Dear {name},",
      body: "Your payment is due shortly. Please review and submit your payment at your earliest convenience.",
      footer: "",
      cta: "Make a payment",
      legalText: "Affirm Loan Services, LLC operates in accordance with applicable UK consumer credit regulations.",
      warning: ""
    },
    B: {
      greeting: "Dear {name},",
      body: "This is a reminder that your payment is due. Please complete it when convenient.",
      footer: "",
      cta: "Make a payment",
      legalText: "Affirm Loan Services, LLC operates in accordance with applicable UK consumer credit regulations.",
      warning: ""
    },
    C: {
      greeting: "Dear {name},",
      body: "You have a payment due. Please process your payment shortly.",
      footer: "",
      cta: "Make a payment",
      legalText: "Affirm Loan Services, LLC operates in accordance with applicable UK consumer credit regulations.",
      warning: ""
    }
  },
  Firm: {
    A: {
      greeting: "Dear {name},",
      body: "Your payment is now overdue. Please submit payment promptly.",
      footer: "",
      cta: "Pay now",
      legalText: "Affirm Loan Services, LLC operates in accordance with applicable UK consumer credit regulations.",
      warning: "Immediate payment is required."
    },
    B: {
      greeting: "Dear {name},",
      body: "Action required: Your payment is overdue and must be completed.",
      footer: "",
      cta: "Pay now",
      legalText: "Affirm Loan Services, LLC operates in accordance with applicable UK consumer credit regulations.",
      warning: "You must complete your payment without delay."
    },
    C: {
      greeting: "Dear {name},",
      body: "Payment overdue. Submit payment immediately.",
      footer: "",
      cta: "Pay now",
      legalText: "Affirm Loan Services, LLC operates in accordance with applicable UK consumer credit regulations.",
      warning: "Payment must be made promptly."
    }
  },
  Educational: {
    A: {
      greeting: "Hello {name},",
      body: "Making your payment on time helps maintain your account in good standing and ensures your loan continues as planned.",
      footer: "If you have questions about your payment, please contact us.",
      cta: "Make a payment",
      legalText: "Affirm Loan Services, LLC operates in accordance with applicable UK consumer credit regulations.",
      warning: ""
    },
    B: {
      greeting: "Hello {name},",
      body: "Timely payments are important for keeping your account active and maintaining your agreed payment schedule.",
      footer: "Need assistance? We're here to help.",
      cta: "Make a payment",
      legalText: "Affirm Loan Services, LLC operates in accordance with applicable UK consumer credit regulations.",
      warning: ""
    },
    C: {
      greeting: "Hello {name},",
      body: "Regular payments help you complete your loan successfully and maintain a positive credit profile.",
      footer: "Questions? Please get in touch.",
      cta: "Make a payment",
      legalText: "Affirm Loan Services, LLC operates in accordance with applicable UK consumer credit regulations.",
      warning: ""
    }
  }
};

// figma-plugin/translations/es-ES.ts
var paymentReminder3 = {
  Supportive: {
    A: {
      greeting: "Hola {name},",
      body: "Queremos recordarte amablemente que tienes un pago pendiente pr\xF3ximo.",
      footer: "Estamos aqu\xED para ayudarte si lo necesitas.",
      cta: "Realizar pago",
      legalText: "Pr\xE9stamos otorgados seg\xFAn la normativa espa\xF1ola de cr\xE9dito al consumo. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Hola {name},",
      body: "Solo un recordatorio amable sobre tu pr\xF3ximo pago.",
      footer: "Cont\xE1ctanos si tienes alguna pregunta.",
      cta: "Realizar pago",
      legalText: "Pr\xE9stamos otorgados seg\xFAn la normativa espa\xF1ola de cr\xE9dito al consumo. Affirm Loan Services, LLC.",
      warning: ""
    },
    C: {
      greeting: "Hola {name},",
      body: "Te contactamos para recordarte tu pago que vence pronto.",
      footer: "Estamos disponibles si necesitas ayuda.",
      cta: "Realizar pago",
      legalText: "Pr\xE9stamos otorgados seg\xFAn la normativa espa\xF1ola de cr\xE9dito al consumo. Affirm Loan Services, LLC.",
      warning: ""
    }
  },
  Neutral: {
    A: {
      greeting: "Hola {name},",
      body: "Tu pago vence pronto. Por favor, revisa y realiza tu pago.",
      footer: "",
      cta: "Realizar pago",
      legalText: "Pr\xE9stamos otorgados seg\xFAn la normativa espa\xF1ola de cr\xE9dito al consumo. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Hola {name},",
      body: "Te recordamos que tienes un pago pr\xF3ximo. Por favor, compl\xE9talo cuando puedas.",
      footer: "",
      cta: "Realizar pago",
      legalText: "Pr\xE9stamos otorgados seg\xFAn la normativa espa\xF1ola de cr\xE9dito al consumo. Affirm Loan Services, LLC.",
      warning: "Debes pagar tu saldo vencido cuanto antes."
    },
    C: {
      greeting: "Hola {name},",
      body: "Tienes un pago pendiente. Por favor, procesa tu pago pronto.",
      footer: "",
      cta: "Realizar pago",
      legalText: "Pr\xE9stamos otorgados seg\xFAn la normativa espa\xF1ola de cr\xE9dito al consumo. Affirm Loan Services, LLC.",
      warning: ""
    }
  },
  Firm: {
    A: {
      greeting: "Estimado/a {name},",
      body: "Tu pago est\xE1 vencido. Realiza el pago inmediatamente.",
      footer: "",
      cta: "Pagar ahora",
      legalText: "Pr\xE9stamos otorgados seg\xFAn la normativa espa\xF1ola de cr\xE9dito al consumo. Affirm Loan Services, LLC.",
      warning: "Debes pagar de inmediato."
    },
    B: {
      greeting: "Estimado/a {name},",
      body: "Acci\xF3n requerida: Completa tu pago vencido ahora.",
      footer: "",
      cta: "Pagar ahora",
      legalText: "Pr\xE9stamos otorgados seg\xFAn la normativa espa\xF1ola de cr\xE9dito al consumo. Affirm Loan Services, LLC.",
      warning: "Debes realizar el pago sin demora."
    },
    C: {
      greeting: "Estimado/a {name},",
      body: "Pago vencido. Procesa el pago inmediatamente para evitar problemas.",
      footer: "",
      cta: "Pagar ahora",
      legalText: "Pr\xE9stamos otorgados seg\xFAn la normativa espa\xF1ola de cr\xE9dito al consumo. Affirm Loan Services, LLC.",
      warning: "Debes pagar tu saldo ahora."
    }
  },
  Educational: {
    A: {
      greeting: "Hola {name},",
      body: "Realizar tu pago a tiempo ayuda a mantener tu cuenta al d\xEDa y contribuye a construir tu historial de pagos positivo.",
      footer: "\xBFTienes preguntas sobre tu pago? Estamos aqu\xED para ayudarte.",
      cta: "Realizar pago",
      legalText: "Pr\xE9stamos otorgados seg\xFAn la normativa espa\xF1ola de cr\xE9dito al consumo. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Hola {name},",
      body: "Los pagos puntuales son importantes para mantener tu cuenta activa y tu calendario de pagos seg\xFAn lo acordado.",
      footer: "\xBFNecesitas ayuda? Cont\xE1ctanos.",
      cta: "Realizar pago",
      legalText: "Pr\xE9stamos otorgados seg\xFAn la normativa espa\xF1ola de cr\xE9dito al consumo. Affirm Loan Services, LLC.",
      warning: ""
    },
    C: {
      greeting: "Hola {name},",
      body: "Los pagos regulares te ayudan a completar tu pr\xE9stamo exitosamente y pueden impactar positivamente tu perfil crediticio.",
      footer: "\xBFPreguntas? Estamos disponibles.",
      cta: "Realizar pago",
      legalText: "Pr\xE9stamos otorgados seg\xFAn la normativa espa\xF1ola de cr\xE9dito al consumo. Affirm Loan Services, LLC.",
      warning: ""
    }
  }
};

// figma-plugin/translations/es-MX.ts
var paymentReminder4 = {
  Supportive: {
    A: {
      greeting: "Hola {name},",
      body: "Queremos recordarte que tienes un pago pr\xF3ximo.",
      footer: "Estamos para ayudarte en lo que necesites.",
      cta: "Realizar pago",
      legalText: "Cr\xE9ditos otorgados conforme a la legislaci\xF3n mexicana. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Hola {name},",
      body: "Solo un recordatorio sobre tu pago que vence pr\xF3ximamente.",
      footer: "Cualquier duda, estamos a tus \xF3rdenes.",
      cta: "Realizar pago",
      legalText: "Cr\xE9ditos otorgados conforme a la legislaci\xF3n mexicana. Affirm Loan Services, LLC.",
      warning: ""
    },
    C: {
      greeting: "Hola {name},",
      body: "Te contactamos para recordarte sobre tu pago pendiente.",
      footer: "Si necesitas ayuda, cont\xE1ctanos.",
      cta: "Realizar pago",
      legalText: "Cr\xE9ditos otorgados conforme a la legislaci\xF3n mexicana. Affirm Loan Services, LLC.",
      warning: ""
    }
  },
  Neutral: {
    A: {
      greeting: "Hola {name},",
      body: "Tu pago vence pronto. Por favor realiza tu pago.",
      footer: "",
      cta: "Realizar pago",
      legalText: "Cr\xE9ditos otorgados conforme a la legislaci\xF3n mexicana. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Hola {name},",
      body: "Este es un recordatorio de tu pago pr\xF3ximo. Por favor compl\xE9talo a la brevedad.",
      footer: "",
      cta: "Realizar pago",
      legalText: "Cr\xE9ditos otorgados conforme a la legislaci\xF3n mexicana. Affirm Loan Services, LLC.",
      warning: "Debes realizar tu pago lo antes posible."
    },
    C: {
      greeting: "Hola {name},",
      body: "Tienes un pago pendiente. Por favor proc\xE9salo pronto.",
      footer: "",
      cta: "Realizar pago",
      legalText: "Cr\xE9ditos otorgados conforme a la legislaci\xF3n mexicana. Affirm Loan Services, LLC.",
      warning: ""
    }
  },
  Firm: {
    A: {
      greeting: "Estimado(a) {name},",
      body: "Tu pago est\xE1 vencido. Realiza el pago de inmediato.",
      footer: "",
      cta: "Pagar ahora",
      legalText: "Cr\xE9ditos otorgados conforme a la legislaci\xF3n mexicana. Affirm Loan Services, LLC.",
      warning: "Es necesario que pagues ahora."
    },
    B: {
      greeting: "Estimado(a) {name},",
      body: "Acci\xF3n requerida: Completa tu pago vencido ahora.",
      footer: "",
      cta: "Pagar ahora",
      legalText: "Cr\xE9ditos otorgados conforme a la legislaci\xF3n mexicana. Affirm Loan Services, LLC.",
      warning: "Necesitas pagar tu saldo de inmediato."
    },
    C: {
      greeting: "Estimado(a) {name},",
      body: "Pago vencido. Procesa el pago inmediatamente.",
      footer: "",
      cta: "Pagar ahora",
      legalText: "Cr\xE9ditos otorgados conforme a la legislaci\xF3n mexicana. Affirm Loan Services, LLC.",
      warning: "Es necesario que realices tu pago ahora."
    }
  },
  Educational: {
    A: {
      greeting: "Hola {name},",
      body: "Realizar tu pago a tiempo ayuda a mantener tu cuenta al corriente y construye un buen historial crediticio.",
      footer: "\xBFTienes dudas sobre tu pago? Estamos para ayudarte.",
      cta: "Realizar pago",
      legalText: "Cr\xE9ditos otorgados conforme a la legislaci\xF3n mexicana. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Hola {name},",
      body: "Los pagos puntuales son importantes para mantener tu cuenta activa y tu calendario de pagos.",
      footer: "\xBFNecesitas ayuda? Cont\xE1ctanos.",
      cta: "Realizar pago",
      legalText: "Cr\xE9ditos otorgados conforme a la legislaci\xF3n mexicana. Affirm Loan Services, LLC.",
      warning: ""
    },
    C: {
      greeting: "Hola {name},",
      body: "Los pagos regulares te ayudan a completar tu cr\xE9dito exitosamente y mejoran tu perfil crediticio.",
      footer: "\xBFPreguntas? Estamos disponibles.",
      cta: "Realizar pago",
      legalText: "Cr\xE9ditos otorgados conforme a la legislaci\xF3n mexicana. Affirm Loan Services, LLC.",
      warning: ""
    }
  }
};

// figma-plugin/translations/pl-PL.ts
var paymentReminder5 = {
  Supportive: {
    A: {
      greeting: "Dzie\u0144 dobry {name},",
      body: "Chcieliby\u015Bmy przypomnie\u0107 o zbli\u017Caj\u0105cej si\u0119 p\u0142atno\u015Bci.",
      footer: "Jeste\u015Bmy dost\u0119pni, je\u015Bli potrzebujesz pomocy.",
      cta: "Zrealizuj p\u0142atno\u015B\u0107",
      legalText: "Po\u017Cyczki udzielane zgodnie z polskim prawem konsumenckim. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Dzie\u0144 dobry {name},",
      body: "To tylko uprzejme przypomnienie o nadchodz\u0105cej p\u0142atno\u015Bci.",
      footer: "Skontaktuj si\u0119 z nami w razie pyta\u0144.",
      cta: "Zrealizuj p\u0142atno\u015B\u0107",
      legalText: "Po\u017Cyczki udzielane zgodnie z polskim prawem konsumenckim. Affirm Loan Services, LLC.",
      warning: ""
    },
    C: {
      greeting: "Dzie\u0144 dobry {name},",
      body: "Kontaktujemy si\u0119 w sprawie Twojej zbli\u017Caj\u0105cej si\u0119 p\u0142atno\u015Bci.",
      footer: "Jeste\u015Bmy do dyspozycji w razie potrzeby.",
      cta: "Zrealizuj p\u0142atno\u015B\u0107",
      legalText: "Po\u017Cyczki udzielane zgodnie z polskim prawem konsumenckim. Affirm Loan Services, LLC.",
      warning: ""
    }
  },
  Neutral: {
    A: {
      greeting: "Szanowny Kliencie {name},",
      body: "Termin p\u0142atno\u015Bci zbli\u017Ca si\u0119. Prosimy o dokonanie p\u0142atno\u015Bci.",
      footer: "",
      cta: "Zrealizuj p\u0142atno\u015B\u0107",
      legalText: "Po\u017Cyczki udzielane zgodnie z polskim prawem konsumenckim. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Szanowny Kliencie {name},",
      body: "Przypominamy o zbli\u017Caj\u0105cym si\u0119 terminie p\u0142atno\u015Bci. Prosimy o jej realizacj\u0119 w najbli\u017Cszym czasie.",
      footer: "",
      cta: "Zrealizuj p\u0142atno\u015B\u0107",
      legalText: "Po\u017Cyczki udzielane zgodnie z polskim prawem konsumenckim. Affirm Loan Services, LLC.",
      warning: ""
    },
    C: {
      greeting: "Szanowny Kliencie {name},",
      body: "Masz zaleg\u0142\u0105 p\u0142atno\u015B\u0107. Prosimy o jej realizacj\u0119 w kr\xF3tkim terminie.",
      footer: "",
      cta: "Zrealizuj p\u0142atno\u015B\u0107",
      legalText: "Po\u017Cyczki udzielane zgodnie z polskim prawem konsumenckim. Affirm Loan Services, LLC.",
      warning: ""
    }
  },
  Firm: {
    A: {
      greeting: "Szanowny Kliencie {name},",
      body: "P\u0142atno\u015B\u0107 jest przeterminowana. Prosimy o natychmiastowe uregulowanie nale\u017Cno\u015Bci.",
      footer: "",
      cta: "Zap\u0142a\u0107 teraz",
      legalText: "Po\u017Cyczki udzielane zgodnie z polskim prawem konsumenckim. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Szanowny Kliencie {name},",
      body: "Wymagane dzia\u0142anie: Nale\u017Cy niezw\u0142ocznie uregulowa\u0107 zaleg\u0142\u0105 p\u0142atno\u015B\u0107.",
      footer: "",
      cta: "Zap\u0142a\u0107 teraz",
      legalText: "Po\u017Cyczki udzielane zgodnie z polskim prawem konsumenckim. Affirm Loan Services, LLC.",
      warning: ""
    },
    C: {
      greeting: "Szanowny Kliencie {name},",
      body: "P\u0142atno\u015B\u0107 przeterminowana. Prosimy o natychmiastowe uregulowanie nale\u017Cno\u015Bci.",
      footer: "",
      cta: "Zap\u0142a\u0107 teraz",
      legalText: "Po\u017Cyczki udzielane zgodnie z polskim prawem konsumenckim. Affirm Loan Services, LLC.",
      warning: ""
    }
  },
  Educational: {
    A: {
      greeting: "Dzie\u0144 dobry {name},",
      body: "Terminowe dokonywanie p\u0142atno\u015Bci pomaga utrzyma\u0107 konto w dobrym stanie i buduje pozytywn\u0105 histori\u0119 kredytow\u0105.",
      footer: "Masz pytania dotycz\u0105ce p\u0142atno\u015Bci? Jeste\u015Bmy dost\u0119pni.",
      cta: "Zrealizuj p\u0142atno\u015B\u0107",
      legalText: "Po\u017Cyczki udzielane zgodnie z polskim prawem konsumenckim. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Dzie\u0144 dobry {name},",
      body: "Terminowe p\u0142atno\u015Bci s\u0105 istotne dla utrzymania aktywno\u015Bci konta i zgodno\u015Bci z ustalonym harmonogramem sp\u0142at.",
      footer: "Potrzebujesz pomocy? Skontaktuj si\u0119 z nami.",
      cta: "Zrealizuj p\u0142atno\u015B\u0107",
      legalText: "Po\u017Cyczki udzielane zgodnie z polskim prawem konsumenckim. Affirm Loan Services, LLC.",
      warning: ""
    },
    C: {
      greeting: "Dzie\u0144 dobry {name},",
      body: "Regularne p\u0142atno\u015Bci pomagaj\u0105 w pomy\u015Blnym zako\u0144czeniu sp\u0142aty po\u017Cyczki i pozytywnie wp\u0142ywaj\u0105 na profil kredytowy.",
      footer: "Pytania? Jeste\u015Bmy dost\u0119pni.",
      cta: "Zrealizuj p\u0142atno\u015B\u0107",
      legalText: "Po\u017Cyczki udzielane zgodnie z polskim prawem konsumenckim. Affirm Loan Services, LLC.",
      warning: ""
    }
  }
};

// figma-plugin/translations/fr-FR.ts
var paymentReminder6 = {
  Supportive: {
    A: {
      greeting: "Bonjour {name},",
      body: "Nous souhaitons vous rappeler que votre paiement arrive \xE0 \xE9ch\xE9ance prochainement.",
      footer: "Nous sommes l\xE0 pour vous aider si besoin.",
      cta: "Effectuer un paiement",
      legalText: "Pr\xEAts accord\xE9s conform\xE9ment \xE0 la r\xE9glementation fran\xE7aise du cr\xE9dit \xE0 la consommation. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Bonjour {name},",
      body: "Juste un rappel amical concernant votre prochain paiement.",
      footer: "N'h\xE9sitez pas \xE0 nous contacter si vous avez des questions.",
      cta: "Effectuer un paiement",
      legalText: "Pr\xEAts accord\xE9s conform\xE9ment \xE0 la r\xE9glementation fran\xE7aise du cr\xE9dit \xE0 la consommation. Affirm Loan Services, LLC.",
      warning: ""
    },
    C: {
      greeting: "Bonjour {name},",
      body: "Nous vous contactons au sujet de votre paiement qui arrive bient\xF4t.",
      footer: "Nous restons \xE0 votre disposition.",
      cta: "Effectuer un paiement",
      legalText: "Pr\xEAts accord\xE9s conform\xE9ment \xE0 la r\xE9glementation fran\xE7aise du cr\xE9dit \xE0 la consommation. Affirm Loan Services, LLC.",
      warning: ""
    }
  },
  Neutral: {
    A: {
      greeting: "Bonjour {name},",
      body: "Votre paiement arrive \xE0 \xE9ch\xE9ance prochainement. Veuillez proc\xE9der au paiement.",
      footer: "",
      cta: "Effectuer un paiement",
      legalText: "Pr\xEAts accord\xE9s conform\xE9ment \xE0 la r\xE9glementation fran\xE7aise du cr\xE9dit \xE0 la consommation. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Bonjour {name},",
      body: "Ceci est un rappel concernant votre paiement \xE0 venir. Veuillez le compl\xE9ter d\xE8s que possible.",
      footer: "",
      cta: "Effectuer un paiement",
      legalText: "Pr\xEAts accord\xE9s conform\xE9ment \xE0 la r\xE9glementation fran\xE7aise du cr\xE9dit \xE0 la consommation. Affirm Loan Services, LLC.",
      warning: ""
    },
    C: {
      greeting: "Bonjour {name},",
      body: "Vous avez un paiement en attente. Veuillez le traiter prochainement.",
      footer: "",
      cta: "Effectuer un paiement",
      legalText: "Pr\xEAts accord\xE9s conform\xE9ment \xE0 la r\xE9glementation fran\xE7aise du cr\xE9dit \xE0 la consommation. Affirm Loan Services, LLC.",
      warning: ""
    }
  },
  Firm: {
    A: {
      greeting: "Madame, Monsieur {name},",
      body: "Votre paiement est en retard. Veuillez effectuer le paiement imm\xE9diatement.",
      footer: "",
      cta: "Payer maintenant",
      legalText: "Pr\xEAts accord\xE9s conform\xE9ment \xE0 la r\xE9glementation fran\xE7aise du cr\xE9dit \xE0 la consommation. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Madame, Monsieur {name},",
      body: "Action requise : Compl\xE9tez votre paiement en retard maintenant.",
      footer: "",
      cta: "Payer maintenant",
      legalText: "Pr\xEAts accord\xE9s conform\xE9ment \xE0 la r\xE9glementation fran\xE7aise du cr\xE9dit \xE0 la consommation. Affirm Loan Services, LLC.",
      warning: ""
    },
    C: {
      greeting: "Madame, Monsieur {name},",
      body: "Paiement en retard. Veuillez traiter le paiement imm\xE9diatement.",
      footer: "",
      cta: "Payer maintenant",
      legalText: "Pr\xEAts accord\xE9s conform\xE9ment \xE0 la r\xE9glementation fran\xE7aise du cr\xE9dit \xE0 la consommation. Affirm Loan Services, LLC.",
      warning: ""
    }
  },
  Educational: {
    A: {
      greeting: "Bonjour {name},",
      body: "Effectuer votre paiement \xE0 temps aide \xE0 maintenir votre compte en r\xE8gle et contribue \xE0 construire un historique de paiement positif.",
      footer: "Des questions sur votre paiement ? Nous sommes l\xE0 pour vous aider.",
      cta: "Effectuer un paiement",
      legalText: "Pr\xEAts accord\xE9s conform\xE9ment \xE0 la r\xE9glementation fran\xE7aise du cr\xE9dit \xE0 la consommation. Affirm Loan Services, LLC.",
      warning: ""
    },
    B: {
      greeting: "Bonjour {name},",
      body: "Les paiements ponctuels sont importants pour maintenir votre compte actif et respecter votre calendrier de remboursement.",
      footer: "Besoin d'aide ? Contactez-nous.",
      cta: "Effectuer un paiement",
      legalText: "Pr\xEAts accord\xE9s conform\xE9ment \xE0 la r\xE9glementation fran\xE7aise du cr\xE9dit \xE0 la consommation. Affirm Loan Services, LLC.",
      warning: ""
    },
    C: {
      greeting: "Bonjour {name},",
      body: "Des paiements r\xE9guliers vous aident \xE0 compl\xE9ter votre pr\xEAt avec succ\xE8s et peuvent impacter positivement votre profil de cr\xE9dit.",
      footer: "Questions ? Nous sommes disponibles.",
      cta: "Effectuer un paiement",
      legalText: "Pr\xEAts accord\xE9s conform\xE9ment \xE0 la r\xE9glementation fran\xE7aise du cr\xE9dit \xE0 la consommation. Affirm Loan Services, LLC.",
      warning: ""
    }
  }
};

// figma-plugin/translations/index.ts
var byLocale = {
  "en-US": paymentReminder,
  "en-GB": paymentReminder2,
  "es-ES": paymentReminder3,
  "es-MX": paymentReminder4,
  "pl-PL": paymentReminder5,
  "fr-FR": paymentReminder6
};
function toEmailContent(v) {
  return __spreadValues({
    greeting: v.greeting,
    body: v.body,
    footer: v.footer,
    cta: v.cta,
    legalText: v.legalText
  }, v.warning !== void 0 && v.warning !== "" ? { warning: v.warning } : {});
}
function getSystemEmailContent(params) {
  const { locale, tone, variant } = params;
  const localeMap = byLocale[locale];
  const toneMap = localeMap && localeMap[tone];
  const content = toneMap && toneMap[variant];
  if (!content) {
    return toEmailContent(paymentReminder[tone][variant]);
  }
  return toEmailContent(content);
}

// src/plugin/emailLayout/spec.ts
var DIVIDER_HEIGHT = 1;
var ATTRIBUTION_LINE_GAP = 8;
function normalizePlaceholderTags(s) {
  if (typeof s !== "string") return s;
  return s.replace(/\[([A-Za-z_][A-Za-z0-9_]*)\]/g, (_, tag) => `{${tag.toLowerCase()}}`);
}
function buildEmailLayoutSpec(params) {
  var _a, _b, _c, _d;
  const { templateName, content, layoutMode, device } = params;
  const legacy = getEmailLayoutSpec(layoutMode);
  const width = PREVIEW_DEVICE_WIDTHS[device];
  const isSpi = layoutMode === "spi";
  const blocks = [];
  if (!isSpi && legacy.headerHeightAffirm > 0) {
    blocks.push({ type: "header", visible: true, height: legacy.headerHeightAffirm });
  }
  if (isSpi) {
    blocks.push({ type: "logo_spi", visible: true });
    blocks.push({ type: "attribution", visible: true });
    blocks.push({ type: "divider", visible: true, height: DIVIDER_HEIGHT });
  }
  const n = normalizePlaceholderTags;
  const titleContent = ((_a = content.title) == null ? void 0 : _a.trim()) || templateName || "\u2014";
  blocks.push({ type: "title", visible: true, content: n(titleContent) });
  blocks.push({ type: "greeting", visible: true, content: n(content.greeting || "\u2014") });
  blocks.push({ type: "body", visible: true, content: n(content.body || "\u2014") });
  blocks.push({
    type: "footer",
    visible: Boolean((_b = content.footer) == null ? void 0 : _b.trim()),
    content: n((_d = (_c = content.footer) == null ? void 0 : _c.trim()) != null ? _d : "")
  });
  if (isSpi && legacy.heroHeight > 0) {
    blocks.push({ type: "hero", visible: true, height: legacy.heroHeight });
  }
  blocks.push({ type: "cta", visible: true, content: n(content.cta || "CTA") });
  blocks.push({ type: "legal", visible: true, content: n(content.legalText || "") });
  return {
    layoutMode,
    device,
    width,
    padding: legacy.padding,
    sectionGap: legacy.itemSpacing,
    ctaMarginTop: 16,
    legalMarginTop: 12,
    cornerRadius: legacy.cornerRadius,
    headerHeight: legacy.headerHeightAffirm,
    heroHeight: legacy.heroHeight,
    dividerHeight: DIVIDER_HEIGHT,
    typography: {
      headingFontSize: legacy.headingFontSize,
      headingLineHeight: legacy.headingLineHeight,
      headingFontWeight: legacy.headingFontWeight === "semibold" ? 600 : 400,
      bodyFontSize: legacy.bodyFontSize,
      bodyLineHeight: legacy.bodyLineHeight,
      legalFontSize: legacy.legalFontSize,
      legalLineHeight: legacy.legalLineHeight,
      ctaFontSize: legacy.ctaFontSize,
      ctaFontWeight: legacy.ctaFontWeight === "semibold" ? 600 : 400
    },
    ctaHeight: legacy.ctaHeight,
    ctaCornerRadius: legacy.ctaCornerRadius,
    fill: legacy.fill,
    stroke: legacy.stroke,
    ctaColorHex: AFFIRM_BLUE_PRIMARY_HEX,
    blocks
  };
}

// src/plugin/icons.ts
var SHOP_PAY_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="99" height="24" fill="none"><g fill="#5433EB" clip-path="url(#a)"><path d="M11.428 7.862 8.5 9.351C7.83 8.199 6.91 7.61 5.629 7.61c-1.395 0-2.092.42-2.092 1.263 0 .899 1.032 1.095 3.346 1.6 2.315.506 4.939 1.236 4.939 4.128 0 2.808-2.175 4.492-5.771 4.492-2.9 0-5.05-1.235-6.051-3.425l2.928-1.46c.613 1.35 1.672 2.05 3.123 2.05 1.505 0 2.258-.422 2.258-1.32 0-.9-1.034-1.095-3.352-1.6C2.639 12.831.025 12.101.025 9.21c0-2.724 2.147-4.436 5.603-4.436 2.706 0 4.742 1.095 5.8 3.088ZM13.883 0h3.625v6.402c.947-1.039 2.314-1.628 3.875-1.628 3.123 0 5.354 2.415 5.354 5.84v8.338h-3.625v-8.338c0-1.6-1.17-2.781-2.788-2.781-1.618 0-2.816 1.207-2.816 2.781v8.338h-3.625V0ZM29.107 5.785c1.2-.843 2.927-1.43 4.768-1.43 4.907 0 8.476 3.34 8.476 7.917 0 4.267-3.067 7.244-7.333 7.244-3.653 0-6.274-2.47-6.274-5.784 0-2.246 1.342-3.903 3.236-4.548l1.533 2.61c-1.031.478-1.42 1.18-1.42 2.05 0 1.43 1.199 2.444 2.927 2.444 2.12 0 3.792-1.686 3.792-3.96 0-2.667-2.09-4.688-4.934-4.688a5.674 5.674 0 0 0-3.151.926l-1.62-2.782ZM47.983 17.352v6.487H44.36V4.914h3.54v1.713c1.089-1.18 2.622-1.853 4.35-1.853 3.82 0 6.804 3.116 6.804 7.16 0 4.044-2.983 7.16-6.803 7.16-1.701 0-3.18-.647-4.267-1.742Zm7.473-5.447c0-2.33-1.617-4.043-3.82-4.043-2.175 0-3.82 1.741-3.82 4.043s1.645 4.044 3.82 4.044c2.203 0 3.822-1.713 3.822-4.044h-.002ZM71.083 7.415h2.234c1.551 0 2.313.642 2.313 1.715 0 1.074-.734 1.715-2.243 1.715h-2.304v-3.43ZM80.699 15.642c-.872 0-1.219-.474-1.219-.948 0-.642.72-.935 2.133-1.102l1.108-.125c-.07 1.227-.887 2.175-2.022 2.175Z"/><path fill-rule="evenodd" d="M65.923 0c-1.997 0-3.616 1.63-3.616 3.64v16.558c0 2.011 1.619 3.641 3.616 3.641h29.462C97.38 23.84 99 22.21 99 20.2V3.64C99 1.63 97.381 0 95.385 0H65.923Zm5.16 16.674v-4.197h2.622c2.396 0 3.67-1.353 3.67-3.402 0-2.05-1.274-3.277-3.67-3.277h-4.311v10.876h1.69Zm9.27.223c1.288 0 2.132-.572 2.52-1.548.11 1.088.761 1.645 2.174 1.269l.014-1.157c-.568.055-.679-.154-.679-.753v-2.845c0-1.673-1.094-2.663-3.115-2.663-1.994 0-3.144 1.004-3.144 2.705h1.551c0-.809.568-1.297 1.565-1.297 1.052 0 1.537.46 1.523 1.255v.363l-1.786.195c-2.008.223-3.116.99-3.116 2.329 0 1.101.776 2.147 2.493 2.147Zm9.837.32c-.707 1.73-1.842 2.245-3.614 2.245h-.762V18.04h.817c.97 0 1.44-.307 1.952-1.185L85.44 9.423h1.745l2.243 5.424 1.994-5.424h1.703l-2.935 7.795Z" clip-rule="evenodd"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h99v24H0z"/></clipPath></defs></svg>`;
var AFFIRM_MARK_SMALL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="39" height="17" fill="none"><mask id="a" width="40" height="22" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#000" d="M.006 22h39V0h-39v22Z"/></mask><g fill-rule="evenodd" clip-rule="evenodd" mask="url(#a)"><path fill="#0B0B0C" d="M2.563 14.543c-.482 0-.723-.236-.723-.623 0-.72.811-.965 2.292-1.121 0 .962-.656 1.744-1.569 1.744Zm.639-5.413c-1.058 0-2.275.495-2.936 1.017l.604 1.26c.53-.48 1.386-.892 2.159-.892.734 0 1.14.244 1.14.734 0 .33-.27.497-.777.563-1.898.244-3.386.764-3.386 2.214 0 1.15.826 1.847 2.116 1.847.92 0 1.74-.508 2.129-1.177v.99h1.715v-4.148c0-1.712-1.2-2.408-2.764-2.408ZM20.427 9.318v6.367h1.836v-3.068c0-1.458.89-1.886 1.51-1.886.243 0 .57.07.785.23l.334-1.683a2.104 2.104 0 0 0-.822-.148c-.944 0-1.538.415-1.929 1.258v-1.07h-1.714ZM33.405 9.13c-.971 0-1.697.57-2.075 1.118-.35-.709-1.093-1.118-1.984-1.118-.97 0-1.643.535-1.953 1.15v-.962h-1.77v6.367h1.838v-3.277c0-1.177.621-1.742 1.2-1.742.526 0 1.008.337 1.008 1.207v3.812h1.835v-3.277c0-1.19.606-1.742 1.213-1.742.485 0 .998.35.998 1.193v3.826h1.834v-4.4c0-1.432-.971-2.155-2.144-2.155ZM15.958 9.317h-1.664v-.648c0-.842.485-1.083.903-1.083.462 0 .822.203.822.203l.566-1.284s-.573-.372-1.617-.372c-1.173 0-2.508.656-2.508 2.716v.468H9.675v-.648c0-.842.485-1.083.903-1.083.238 0 .557.054.822.203l.566-1.284c-.338-.196-.88-.372-1.617-.372-1.173 0-2.508.656-2.508 2.716v.468H6.775v1.405h1.066v4.963h1.834v-4.963h2.785v4.963h1.834v-4.963h1.664V9.317ZM17.052 15.685h1.833V9.317h-1.833v6.368Z"/><path fill="#4A4AF4" d="M27.631 0c-4.956 0-9.372 3.412-10.625 7.8h1.796c1.047-3.267 4.601-6.135 8.83-6.135 5.14 0 9.581 3.881 9.581 9.924 0 1.357-.177 2.58-.512 3.661h1.742l.018-.06c.285-1.114.43-2.325.43-3.6 0-6.74-4.95-11.59-11.26-11.59Z"/></g></svg>`;
var AFFIRM_LOGO_WHITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40" fill="none"><path fill="#F7F7F8" d="M32.772 22.253h-3.219V21.01c0-1.631.944-2.103 1.76-2.103.901 0 1.588.386 1.588.386l1.073-2.49s-1.116-.729-3.133-.729c-2.275 0-4.85 1.288-4.85 5.279v.901H20.67V21.01c0-1.631.944-2.103 1.76-2.103.472 0 1.073.085 1.588.386l1.073-2.49c-.644-.386-1.717-.729-3.133-.729-2.275 0-4.85 1.288-4.85 5.279v.901h-2.06V25h2.06v9.614h3.52V25h5.407v9.614h3.52V25h3.218v-2.747ZM41.356 22.253v12.36h3.52v-5.965c0-2.833 1.717-3.648 2.918-3.648.472 0 1.116.129 1.502.43l.644-3.263a4.49 4.49 0 0 0-1.588-.3c-1.802 0-2.961.815-3.734 2.446v-2.06h-3.262Z"/><path fill="#F7F7F8" fill-rule="evenodd" d="M8.18 21.91c-2.017 0-4.377.944-5.665 1.974l1.159 2.447c1.03-.945 2.66-1.717 4.163-1.717 1.416 0 2.189.472 2.189 1.416 0 .644-.515.944-1.502 1.073C4.876 27.575 2 28.563 2 31.395 2 33.627 3.588 35 6.077 35c1.76 0 3.348-.987 4.12-2.275v1.889h3.305v-8.069c0-3.305-2.318-4.635-5.322-4.635ZM6.936 32.382c-.945 0-1.374-.472-1.374-1.202 0-1.416 1.545-1.888 4.42-2.189 0 1.889-1.287 3.391-3.046 3.391Z" clip-rule="evenodd"/><path fill="#F7F7F8" d="M62.386 24.099c.73-1.073 2.104-2.19 3.992-2.19 2.275 0 4.12 1.374 4.077 4.164v8.54h-3.52V27.19c0-1.631-.986-2.318-1.93-2.318-1.16 0-2.318 1.073-2.318 3.39v6.353h-3.52v-7.382c0-1.717-.9-2.36-1.93-2.36-1.117 0-2.318 1.115-2.318 3.39v6.352h-3.52v-12.36h3.391v1.888c.6-1.202 1.888-2.232 3.777-2.232 1.716 0 3.133.815 3.82 2.189ZM34.876 22.253h3.52v12.36h-3.52v-12.36Z"/><path fill="#F7F7F8" d="M55.477 5c-9.528 0-18.07 6.61-20.473 15.15h3.477C40.498 13.798 47.365 8.22 55.476 8.22c9.915 0 18.455 7.554 18.455 19.27 0 2.618-.343 5.022-.987 7.125h3.348l.043-.129c.558-2.146.815-4.506.815-6.996C77.15 14.442 67.622 5 55.476 5Z"/></svg>`;

// src/plugin/emailLayout/tokens.ts
var CTA_FILL = { r: 74 / 255, g: 74 / 255, b: 244 / 255 };
var CTA_LABEL_FILL = { r: 1, g: 1, b: 1 };
var HEADER_FILL = { r: 0, g: 0, b: 0 };
var LEGAL_FILL = { r: 0.45, g: 0.45, b: 0.45 };
var HERO_FILL = { r: 0.96, g: 0.96, b: 0.96 };
var STROKE_DEFAULT = { r: 0.88, g: 0.88, b: 0.88 };
var PARENT_FILL = { r: 1, g: 1, b: 1 };
var PARENT_STROKE = { r: 0.9, g: 0.9, b: 0.9 };
var SPACING_FRAME_GAP = 24;
var SPACING_PLACEMENT_OFFSET = 80;
var STROKE_WEIGHT = 1;

// src/plugin/emailLayout/renderFigma.ts
function renderSpecToFigma(spec, ctx) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const { card, cardWidth, font, headingFont, ctaFont, legalFill, ctaFill, headerFill, heroFill } = ctx;
  const lineHeightHeading = { value: spec.typography.headingLineHeight, unit: "PIXELS" };
  const lineHeightBody = { value: spec.typography.bodyLineHeight, unit: "PIXELS" };
  const lineHeightLegal = { value: spec.typography.legalLineHeight, unit: "PIXELS" };
  const isAffirm = spec.layoutMode === "affirm";
  for (const block of spec.blocks) {
    if (!block.visible) continue;
    switch (block.type) {
      case "header": {
        const headerFrame = figma.createFrame();
        headerFrame.name = "Header";
        headerFrame.layoutMode = "HORIZONTAL";
        headerFrame.primaryAxisSizingMode = "AUTO";
        headerFrame.counterAxisSizingMode = "FIXED";
        headerFrame.primaryAxisAlignItems = "CENTER";
        headerFrame.counterAxisAlignItems = "CENTER";
        const headerHeight = (_a = block.height) != null ? _a : spec.headerHeight;
        headerFrame.resize(cardWidth, headerHeight);
        headerFrame.fills = [{ type: "SOLID", color: headerFill }];
        try {
          const logoNode = figma.createNodeFromSvg(AFFIRM_LOGO_WHITE_SVG);
          headerFrame.appendChild(logoNode);
        } catch (e) {
          const fallback = figma.createText();
          fallback.fontName = headingFont;
          fallback.fontSize = 16;
          fallback.characters = "affirm";
          fallback.fills = [{ type: "SOLID", color: CTA_LABEL_FILL }];
          headerFrame.appendChild(fallback);
        }
        card.appendChild(headerFrame);
        if (isAffirm) {
          headerFrame.layoutPositioning = "ABSOLUTE";
          headerFrame.x = 0;
          headerFrame.y = 0;
        } else {
          headerFrame.layoutSizingHorizontal = "FILL";
        }
        break;
      }
      case "logo_spi": {
        try {
          const shopPayNode = figma.createNodeFromSvg(SHOP_PAY_LOGO_SVG);
          card.appendChild(shopPayNode);
          shopPayNode.layoutSizingHorizontal = "HUG";
        } catch (e) {
        }
        break;
      }
      case "attribution": {
        const row = figma.createFrame();
        row.name = "Installments line";
        row.layoutMode = "HORIZONTAL";
        row.primaryAxisSizingMode = "AUTO";
        row.counterAxisSizingMode = "AUTO";
        row.primaryAxisAlignItems = "MIN";
        row.counterAxisAlignItems = "CENTER";
        if (ctx.applySpacing) {
          ctx.applySpacing(row, "itemSpacing", "attributionGap", ATTRIBUTION_LINE_GAP);
        } else {
          row.itemSpacing = ATTRIBUTION_LINE_GAP;
        }
        const text = figma.createText();
        text.fontName = font;
        text.fontSize = spec.typography.legalFontSize;
        text.lineHeight = lineHeightLegal;
        text.characters = "Installments are provided and serviced by";
        text.textAlignHorizontal = "LEFT";
        text.textAutoResize = "HEIGHT";
        text.fills = [{ type: "SOLID", color: legalFill }];
        row.appendChild(text);
        text.layoutSizingHorizontal = "HUG";
        try {
          const mark = figma.createNodeFromSvg(AFFIRM_MARK_SMALL_SVG);
          row.appendChild(mark);
          mark.layoutSizingHorizontal = "HUG";
        } catch (e) {
        }
        card.appendChild(row);
        row.layoutSizingHorizontal = "FILL";
        break;
      }
      case "divider": {
        const line = figma.createFrame();
        line.name = "Divider";
        line.resize(cardWidth, (_b = block.height) != null ? _b : spec.dividerHeight);
        line.fills = [{ type: "SOLID", color: STROKE_DEFAULT }];
        card.appendChild(line);
        line.layoutSizingHorizontal = "FILL";
        break;
      }
      case "title": {
        const text = figma.createText();
        text.fontName = headingFont;
        text.fontSize = spec.typography.headingFontSize;
        text.lineHeight = lineHeightHeading;
        text.characters = (_c = block.content) != null ? _c : "\u2014";
        text.textAlignHorizontal = "LEFT";
        text.textAutoResize = "HEIGHT";
        card.appendChild(text);
        text.layoutSizingHorizontal = "FILL";
        break;
      }
      case "greeting": {
        const text = figma.createText();
        text.fontName = font;
        text.fontSize = spec.typography.bodyFontSize;
        text.lineHeight = lineHeightBody;
        text.characters = (_d = block.content) != null ? _d : "\u2014";
        text.textAlignHorizontal = "LEFT";
        text.textAutoResize = "HEIGHT";
        card.appendChild(text);
        text.layoutSizingHorizontal = "FILL";
        break;
      }
      case "body": {
        const text = figma.createText();
        text.fontName = font;
        text.fontSize = spec.typography.bodyFontSize;
        text.lineHeight = lineHeightBody;
        text.characters = (_e = block.content) != null ? _e : "\u2014";
        text.textAlignHorizontal = "LEFT";
        text.textAutoResize = "HEIGHT";
        card.appendChild(text);
        text.layoutSizingHorizontal = "FILL";
        text.layoutSizingVertical = "HUG";
        break;
      }
      case "footer": {
        const text = figma.createText();
        text.fontName = font;
        text.fontSize = spec.typography.bodyFontSize;
        text.lineHeight = lineHeightBody;
        text.characters = (_f = block.content) != null ? _f : "";
        text.textAlignHorizontal = "LEFT";
        text.textAutoResize = "HEIGHT";
        card.appendChild(text);
        text.layoutSizingHorizontal = "FILL";
        break;
      }
      case "hero": {
        const heroFrame = figma.createFrame();
        heroFrame.name = "Hero";
        heroFrame.layoutMode = "HORIZONTAL";
        heroFrame.primaryAxisSizingMode = "AUTO";
        heroFrame.counterAxisSizingMode = "FIXED";
        heroFrame.primaryAxisAlignItems = "CENTER";
        heroFrame.counterAxisAlignItems = "CENTER";
        heroFrame.resize(cardWidth, (_g = block.height) != null ? _g : spec.heroHeight);
        heroFrame.fills = [{ type: "SOLID", color: heroFill }];
        heroFrame.cornerRadius = spec.cornerRadius;
        card.appendChild(heroFrame);
        heroFrame.layoutSizingHorizontal = "FILL";
        break;
      }
      case "cta": {
        const ctaFrame = figma.createFrame();
        ctaFrame.name = "CTA";
        ctaFrame.layoutMode = "HORIZONTAL";
        ctaFrame.primaryAxisSizingMode = "AUTO";
        ctaFrame.counterAxisSizingMode = "FIXED";
        ctaFrame.primaryAxisAlignItems = "CENTER";
        ctaFrame.counterAxisAlignItems = "CENTER";
        ctaFrame.resize(cardWidth, spec.ctaHeight);
        ctaFrame.fills = [{ type: "SOLID", color: ctaFill }];
        ctaFrame.cornerRadius = spec.ctaCornerRadius;
        const label = figma.createText();
        label.fontName = ctaFont;
        label.fontSize = spec.typography.ctaFontSize;
        label.characters = (_h = block.content) != null ? _h : "CTA";
        label.textAlignHorizontal = "CENTER";
        label.fills = [{ type: "SOLID", color: CTA_LABEL_FILL }];
        label.textAutoResize = "NONE";
        ctaFrame.appendChild(label);
        card.appendChild(ctaFrame);
        ctaFrame.layoutSizingHorizontal = "FILL";
        ctaFrame.layoutSizingVertical = "FIXED";
        break;
      }
      case "legal": {
        const text = figma.createText();
        text.fontName = font;
        text.fontSize = spec.typography.legalFontSize;
        text.lineHeight = lineHeightLegal;
        text.characters = (_i = block.content) != null ? _i : "";
        text.textAlignHorizontal = "LEFT";
        text.textAutoResize = "HEIGHT";
        text.fills = [{ type: "SOLID", color: legalFill }];
        card.appendChild(text);
        text.layoutSizingHorizontal = "FILL";
        break;
      }
      default:
        break;
    }
  }
}

// src/plugin/genomeTokens.ts
var GENOME_SPACING_NAMES = {
  sectionPaddingX: "onPage/section/horizontal/xl",
  sectionPaddingY: "onPage/section/vertical/xl",
  stackGapPrimary: "onPage/section/vertical/xl",
  stackGapSecondary: "onSurface/component/vertical/md",
  attributionGap: "onSurface/component/vertical/sm",
  buttonPaddingX: "onSurface/button/horizontal/md",
  buttonPaddingY: "onSurface/button/vertical/md"
};
var nameToVariable = null;
var warnedKeys = /* @__PURE__ */ new Set();
async function resolveGenomeSpacingTokens() {
  if (nameToVariable != null) return;
  const map = /* @__PURE__ */ new Map();
  try {
    const variables = await figma.variables.getLocalVariablesAsync();
    for (const v of variables) {
      if (v.name) map.set(v.name, v);
    }
    nameToVariable = map;
  } catch (e) {
    nameToVariable = map;
  }
}
function getResolvedVariable(tokenKey) {
  var _a;
  if (nameToVariable == null) return null;
  const name = GENOME_SPACING_NAMES[tokenKey];
  return (_a = nameToVariable.get(name)) != null ? _a : null;
}
function applySpacingBinding(node, field, tokenKey, pxFallback) {
  const variable = getResolvedVariable(tokenKey);
  if (variable != null) {
    try {
      node.setBoundVariable(field, variable);
      return;
    } catch (e) {
    }
  }
  switch (field) {
    case "itemSpacing":
      node.itemSpacing = pxFallback;
      break;
    case "paddingLeft":
      node.paddingLeft = pxFallback;
      break;
    case "paddingRight":
      node.paddingRight = pxFallback;
      break;
    case "paddingTop":
      node.paddingTop = pxFallback;
      break;
    case "paddingBottom":
      node.paddingBottom = pxFallback;
      break;
    default:
      return;
  }
  if (!warnedKeys.has(tokenKey)) {
    warnedKeys.add(tokenKey);
    console.warn(
      `[Genome tokens] Variable "${GENOME_SPACING_NAMES[tokenKey]}" not found; using ${pxFallback}px for ${tokenKey}.`
    );
  }
}
async function getAllVariableNamesForDump() {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const out = [];
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    for (const col of collections) {
      const collectionName = (_a = col.name) != null ? _a : "Unnamed";
      for (const id of col.variableIds) {
        const v = await figma.variables.getVariableByIdAsync(id);
        if (v) out.push({ collection: collectionName, name: (_b = v.name) != null ? _b : "", id: v.id });
      }
    }
    if (typeof figma.teamLibrary !== "undefined" && figma.teamLibrary != null) {
      try {
        const libraryCollections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
        for (const libCol of libraryCollections) {
          const collectionName = "Library: " + ((_d = (_c = libCol.name) != null ? _c : libCol.key) != null ? _d : "Unnamed");
          try {
            const libVars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(libCol.key);
            for (const v of libVars) {
              const name = (_f = (_e = v.name) != null ? _e : v.key) != null ? _f : "";
              const id = (_h = (_g = v.key) != null ? _g : v.id) != null ? _h : "";
              out.push({ collection: collectionName, name, id });
            }
          } catch (err) {
            console.warn("[Genome tokens] getVariablesInLibraryCollectionAsync failed for", libCol.key, err);
          }
        }
      } catch (e) {
        console.warn("[Genome tokens] getAvailableLibraryVariableCollectionsAsync failed:", e);
      }
    }
    out.sort((a, b) => (a.collection + "/" + a.name).localeCompare(b.collection + "/" + b.name));
  } catch (e) {
    console.error("[Genome tokens] getAllVariableNamesForDump failed:", e);
  }
  return out;
}

// src/plugin/code.ts
function getEffectiveLocale(state2) {
  var _a, _b;
  const templateId = state2.selectedTemplateId;
  if (!isCustomTemplateId(templateId)) return state2.locale;
  const custom = state2.customTemplatesContent[templateId];
  if (!custom) return state2.locale;
  const requested = (_b = (_a = state2.templates) == null ? void 0 : _a.selectedTemplateLocale) != null ? _b : custom.baseLocale;
  return custom.locales[requested] ? requested : custom.baseLocale;
}
function buildVariantsOnly(state2) {
  var _a, _b, _c, _d;
  const templateId = state2.selectedTemplateId;
  const templateInfo = getTemplateById(state2, templateId);
  if (!templateId || !templateInfo) return null;
  const tone = state2.tone;
  const isCustom = isCustomTemplateId(templateId);
  let locale;
  let variants;
  if (isCustom) {
    const customContent = state2.customTemplatesContent[templateId];
    if (!customContent) return null;
    const requestedLocale = (_b = (_a = state2.templates) == null ? void 0 : _a.selectedTemplateLocale) != null ? _b : customContent.baseLocale;
    let localeEntry = customContent.locales[requestedLocale];
    if (!localeEntry) {
      locale = customContent.baseLocale;
      localeEntry = customContent.locales[customContent.baseLocale];
    } else {
      locale = requestedLocale;
    }
    if (!localeEntry) return null;
    variants = localeEntry.variants;
  } else {
    locale = state2.locale;
    variants = {
      A: getSystemEmailContent({ templateId, locale, tone, variant: "A" }),
      B: getSystemEmailContent({ templateId, locale, tone, variant: "B" }),
      C: getSystemEmailContent({ templateId, locale, tone, variant: "C" })
    };
  }
  const templateName = ((_c = templateInfo.name) == null ? void 0 : _c[locale]) != null ? templateInfo.name[locale] : ((_d = templateInfo.name) == null ? void 0 : _d["en-US"]) != null ? templateInfo.name["en-US"] : templateId != null ? String(templateId) : "Template";
  return { templateName, locale, tone, layoutMode: state2.layoutMode, previewDevice: state2.previewDevice, variants };
}
var DEV_RESET_STORAGE_ENABLED = false;
var VARIANT_ORDER = ["A", "B", "C"];
var SYNC_NAMESPACE = "affirm_spam";
var SYNC_KEY_LIBRARY = "library_v1";
var SYNC_KEY_META = "library_v1_meta";
function buildLibrarySnapshot(state2) {
  var _a, _b;
  const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  const updatedBy = typeof figma.currentUser !== "undefined" && figma.currentUser != null ? (_b = (_a = figma.currentUser.name) != null ? _a : figma.currentUser.id) != null ? _b : void 0 : void 0;
  return {
    version: 1,
    updatedAt,
    updatedBy,
    templates: state2.templateCatalog,
    customTemplatesContent: state2.customTemplatesContent
  };
}
function getStoredSnapshot() {
  const raw = figma.root.getSharedPluginData(SYNC_NAMESPACE, SYNC_KEY_LIBRARY);
  if (raw == null || raw === "") return { kind: "none" };
  try {
    const parsed = JSON.parse(raw);
    if (parsed != null && typeof parsed === "object" && parsed.version === 1 && typeof parsed.updatedAt === "string" && Array.isArray(parsed.templates) && typeof parsed.customTemplatesContent === "object" && parsed.customTemplatesContent !== null && !Array.isArray(parsed.customTemplatesContent)) {
      return { kind: "ok", snapshot: parsed };
    }
  } catch (e) {
  }
  return { kind: "invalid" };
}
function writeSnapshot(snapshot) {
  const libraryHash = computeLibraryHash(snapshot.templates, snapshot.customTemplatesContent);
  figma.root.setSharedPluginData(SYNC_NAMESPACE, SYNC_KEY_LIBRARY, JSON.stringify(snapshot));
  if (SYNC_KEY_META) {
    const meta = {
      lastSyncedAt: snapshot.updatedAt,
      lastSyncedBy: snapshot.updatedBy,
      libraryHash
    };
    figma.root.setSharedPluginData(SYNC_NAMESPACE, SYNC_KEY_META, JSON.stringify(meta));
  }
}
function applyPulledSnapshot(state2, snapshot) {
  state2.templateCatalog = snapshot.templates;
  state2.customTemplatesContent = snapshot.customTemplatesContent;
  state2.syncMeta = { lastSyncedAt: snapshot.updatedAt, lastSyncedBy: snapshot.updatedBy };
  const stillExists = state2.templateCatalog.some((t) => t.id === state2.selectedTemplateId);
  if (!stillExists && state2.templateCatalog.length > 0) {
    state2.selectedTemplateId = state2.templateCatalog[0].id;
  } else if (state2.templateCatalog.length === 0) {
    state2.selectedTemplateId = "";
  }
  state2.generated = void 0;
  state2.exportState = "idle";
}
var AUTO_SYNC_DEBOUNCE_MS = 800;
var autoSyncDebounceTimeoutId = null;
function maybeAutoSyncLibrary(_reason) {
  var _a;
  if (!((_a = state.settings) == null ? void 0 : _a.autoSyncToFile)) return;
  if (autoSyncDebounceTimeoutId != null) {
    clearTimeout(autoSyncDebounceTimeoutId);
    autoSyncDebounceTimeoutId = null;
  }
  autoSyncDebounceTimeoutId = setTimeout(() => {
    autoSyncDebounceTimeoutId = null;
    try {
      const snapshot = buildLibrarySnapshot(state);
      writeSnapshot(snapshot);
      const lastFileHash = computeLibraryHash(snapshot.templates, snapshot.customTemplatesContent);
      state.syncMeta = {
        lastSyncedAt: snapshot.updatedAt,
        lastSyncedBy: snapshot.updatedBy,
        lastFileHash
      };
      sendState();
      saveState(state).catch(() => {
      });
    } catch (e) {
      sendToast("Auto-sync failed.");
    }
  }, AUTO_SYNC_DEBOUNCE_MS);
}
figma.showUI(__html__, { width: 900, height: 720 });
var state = getDefaultState();
function sendState() {
  var _a, _b, _c;
  state.ui = computeUi(state.selectedTemplateId, state.prototypeState);
  state.templates = state.templates != null ? state.templates : {};
  state.libraryStatus = {
    localHash: computeLibraryHash(state.templateCatalog, state.customTemplatesContent),
    fileHash: (_a = state.syncMeta) == null ? void 0 : _a.lastFileHash,
    lastSyncedAt: (_b = state.syncMeta) == null ? void 0 : _b.lastSyncedAt,
    lastSyncedBy: (_c = state.syncMeta) == null ? void 0 : _c.lastSyncedBy
  };
  figma.ui.postMessage({ type: "STATE", state });
}
function sendError(message) {
  figma.ui.postMessage({ type: "ERROR", message });
}
function sendToast(message) {
  figma.ui.postMessage({ type: "TOAST", message });
}
function getTemplateById(state2, id) {
  return state2.templateCatalog.find((t) => t.id === id);
}
async function insertVariantsToCanvas(payload, selectedVariants) {
  const page = figma.currentPage;
  if (!page) {
    throw new Error("No page available.");
  }
  const { templateName, locale, tone, layoutMode, previewDevice, variants } = payload;
  const toInsert = selectedVariants.length > 0 ? selectedVariants : VARIANT_ORDER;
  const layoutLabel = layoutMode === "spi" ? "SPI" : "Affirm";
  const frameName = `Affirm SPAM \u2014 ${templateName} \u2014 ${locale} \u2014 ${tone} \u2014 ${layoutLabel}`;
  const legacySpec = getEmailLayoutSpec(layoutMode);
  const cardWidth = PREVIEW_DEVICE_WIDTHS[previewDevice];
  await resolveGenomeSpacingTokens();
  const applySpacing = (node, field, tokenKey, pxFallback) => {
    applySpacingBinding(node, field, tokenKey, pxFallback);
  };
  const font = { family: EMAIL_LAYOUT_FONT_FAMILY, style: "Regular" };
  const fontSemibold = { family: EMAIL_LAYOUT_FONT_FAMILY, style: "Semi Bold" };
  let hasSemibold = false;
  try {
    await figma.loadFontAsync(font);
    await figma.loadFontAsync(fontSemibold);
    hasSemibold = true;
  } catch (e) {
    try {
      await figma.loadFontAsync(font);
    } catch (e2) {
      throw new Error("Could not load font.");
    }
  }
  const headingFont = hasSemibold && legacySpec.headingFontWeight === "semibold" ? fontSemibold : font;
  const ctaFont = hasSemibold && legacySpec.ctaFontWeight === "semibold" ? fontSemibold : font;
  const parent = figma.createFrame();
  parent.name = frameName;
  parent.layoutMode = "HORIZONTAL";
  parent.primaryAxisSizingMode = "AUTO";
  parent.counterAxisSizingMode = "AUTO";
  applySpacing(parent, "itemSpacing", "stackGapPrimary", SPACING_FRAME_GAP);
  applySpacing(parent, "paddingLeft", "sectionPaddingX", legacySpec.padding);
  applySpacing(parent, "paddingRight", "sectionPaddingX", legacySpec.padding);
  applySpacing(parent, "paddingTop", "sectionPaddingY", legacySpec.padding);
  applySpacing(parent, "paddingBottom", "sectionPaddingY", legacySpec.padding);
  parent.fills = [{ type: "SOLID", color: PARENT_FILL }];
  parent.strokes = [{ type: "SOLID", color: PARENT_STROKE }];
  parent.strokeWeight = STROKE_WEIGHT;
  parent.cornerRadius = legacySpec.cornerRadius;
  for (const variant of toInsert) {
    const content = variants[variant];
    const spec = buildEmailLayoutSpec({
      templateName,
      content,
      layoutMode,
      device: previewDevice
    });
    const card = figma.createFrame();
    card.name = `Variant ${variant}`;
    card.layoutMode = "VERTICAL";
    card.primaryAxisSizingMode = "AUTO";
    card.counterAxisSizingMode = "FIXED";
    card.counterAxisAlignItems = "MIN";
    applySpacing(card, "itemSpacing", "stackGapSecondary", spec.sectionGap);
    const isAffirmLayout = layoutMode === "affirm";
    applySpacing(card, "paddingLeft", "sectionPaddingX", spec.padding);
    applySpacing(card, "paddingRight", "sectionPaddingX", spec.padding);
    if (isAffirmLayout) {
      card.paddingTop = legacySpec.headerHeightAffirm + 16;
    } else {
      applySpacing(card, "paddingTop", "sectionPaddingY", spec.padding);
    }
    applySpacing(card, "paddingBottom", "sectionPaddingY", spec.padding);
    card.fills = [{ type: "SOLID", color: spec.fill }];
    card.strokes = [{ type: "SOLID", color: spec.stroke }];
    card.strokeWeight = STROKE_WEIGHT;
    card.cornerRadius = spec.cornerRadius;
    renderSpecToFigma(spec, {
      card,
      cardWidth,
      font,
      headingFont,
      ctaFont,
      legalFill: LEGAL_FILL,
      ctaFill: CTA_FILL,
      headerFill: HEADER_FILL,
      heroFill: HERO_FILL,
      strokeColor: spec.stroke,
      applySpacing
    });
    const contentHeight = Math.max(card.height || 0, 500);
    card.resize(cardWidth, contentHeight);
    parent.appendChild(card);
  }
  if (parent.children.length !== toInsert.length) {
    const msg = `Insert guard: expected ${toInsert.length} cards, got ${parent.children.length}.`;
    parent.remove();
    throw new Error(msg);
  }
  page.appendChild(parent);
  const selection = figma.currentPage.selection;
  if (selection.length > 0 && selection[0] && "x" in selection[0] && "width" in selection[0]) {
    const node = selection[0];
    parent.x = node.x + (node.width != null ? node.width : 0) + SPACING_PLACEMENT_OFFSET;
    parent.y = node.y != null ? node.y : 0;
  } else {
    const center = figma.viewport.center;
    parent.x = center.x - parent.width / 2;
    parent.y = center.y - parent.height / 2;
  }
  figma.currentPage.selection = [parent];
  figma.viewport.scrollAndZoomIntoView([parent]);
  sendToast(`Inserted: ${toInsert.join(", ")} \xB7 ${previewDevice} \xB7 ${layoutLabel}`);
}
figma.ui.onmessage = async (msg) => {
  var _a, _b, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
  if (typeof msg !== "object" || msg === null || !("type" in msg)) return;
  const m = msg;
  try {
    switch (m.type) {
      case "INIT": {
        state = await loadState();
        const stored = getStoredSnapshot();
        if (stored.kind === "ok") {
          const lastFileHash = computeLibraryHash(
            stored.snapshot.templates,
            stored.snapshot.customTemplatesContent
          );
          state.syncMeta = {
            lastSyncedAt: stored.snapshot.updatedAt,
            lastSyncedBy: stored.snapshot.updatedBy,
            lastFileHash
          };
        } else if (stored.kind === "none") {
          state.syncMeta = void 0;
        }
        sendState();
        break;
      }
      case "SET_LOCALE":
        if (isCustomTemplateId(state.selectedTemplateId)) {
          sendToast("Locale is locked for custom templates.");
          break;
        }
        state.locale = m.locale;
        if (state.prototypeState === "draft-unsaved") state.draftLocale = m.locale;
        state.exportState = "idle";
        state.generated = void 0;
        await saveState(state);
        sendState();
        break;
      case "SET_TONE":
        state.tone = m.tone;
        state.exportState = "idle";
        state.generated = void 0;
        await saveState(state);
        sendState();
        break;
      case "SET_LAYOUT_MODE":
        state.layoutMode = m.layoutMode;
        state.generated = void 0;
        await saveState(state);
        sendState();
        break;
      case "SET_PREVIEW_DEVICE":
        state.previewDevice = m.previewDevice;
        await saveState(state);
        sendState();
        break;
      case "TOGGLE_VARIANT": {
        const idx = state.selectedVariants.indexOf(m.variant);
        if (idx >= 0) state.selectedVariants = state.selectedVariants.filter((v) => v !== m.variant);
        else state.selectedVariants = [...state.selectedVariants, m.variant];
        await saveState(state);
        sendState();
        break;
      }
      case "SELECT_TEMPLATE":
        state.selectedTemplateId = m.templateId;
        if (!String(m.templateId).startsWith("custom-")) {
          state.templates = __spreadValues({}, state.templates);
          delete state.templates.selectedTemplateLocale;
        }
        state.exportState = "idle";
        state.isDeprecated = false;
        state.generated = void 0;
        await saveState(state);
        sendState();
        break;
      case "START_ADD_TEMPLATE":
        state.prototypeState = "draft-unsaved";
        state.draftName = "";
        state.draftLocale = "es-MX";
        state.draftText = "";
        state.isDraftDirty = false;
        await saveState(state);
        sendState();
        break;
      case "UPDATE_DRAFT":
        state.draftName = m.payload.name;
        state.draftLocale = m.payload.locale;
        state.draftText = m.payload.text;
        state.isDraftDirty = true;
        await saveState(state);
        sendState();
        break;
      case "SAVE_DRAFT": {
        const payload = m.payload;
        const id = `custom-${Date.now()}`;
        const displayName = payload.name || `Payment reminder \u2013 ${payload.locale}`;
        const nameForLocales = {
          "en-US": displayName,
          "en-GB": displayName,
          "es-ES": displayName,
          "es-MX": displayName,
          "pl-PL": displayName,
          "fr-FR": displayName
        };
        const descriptionForLocales = {
          "en-US": "Custom template created from draft",
          "en-GB": "Custom template created from draft",
          "es-ES": "Plantilla personalizada creada desde borrador",
          "es-MX": "Plantilla personalizada creada desde borrador",
          "pl-PL": "Szablon niestandardowy utworzony z wersji roboczej",
          "fr-FR": "Mod\xE8le personnalis\xE9 cr\xE9\xE9 \xE0 partir du brouillon"
        };
        const newTemplate = { id, name: nameForLocales, description: descriptionForLocales, intent: "Repayments" };
        state.templateCatalog = [newTemplate, ...state.templateCatalog];
        state.selectedTemplateId = id;
        state.isBaseTemplate = false;
        state.locale = payload.locale;
        state.prototypeState = "normal";
        const draftBody = payload.text.trim() || "No content.";
        const baseContent = {
          greeting: "Hello {name},",
          body: draftBody,
          footer: "",
          cta: "Make a payment",
          legalText: "Loans made or arranged pursuant to applicable law. Affirm Loan Services, LLC."
        };
        const baseLocale = payload.locale;
        state.customTemplatesContent = __spreadProps(__spreadValues({}, state.customTemplatesContent), {
          [id]: {
            baseLocale,
            locales: {
              [baseLocale]: { tone: "Neutral", variants: { A: __spreadValues({}, baseContent), B: __spreadValues({}, baseContent), C: __spreadValues({}, baseContent) }, status: "custom" }
            }
          }
        });
        await saveState(state);
        sendState();
        break;
      }
      case "CANCEL_DRAFT":
        state.prototypeState = "normal";
        await saveState(state);
        sendState();
        break;
      case "RESOLVE_COMPLIANCE_ISSUE": {
        const arr = state.resolvedComplianceIssues[m.locale] != null ? state.resolvedComplianceIssues[m.locale] : [];
        if (!arr.includes(m.issueIndex)) {
          state.resolvedComplianceIssues = __spreadProps(__spreadValues({}, state.resolvedComplianceIssues), { [m.locale]: [...arr, m.issueIndex] });
          await saveState(state);
        }
        sendState();
        break;
      }
      case "SHOW_TOAST":
        if (typeof m.message === "string") sendToast(m.message);
        break;
      case "EXPORT_SELECTED":
        if (state.isDeprecated || state.selectedVariants.length === 0) break;
        state.exportState = "exported-selected";
        state.lastExportedAt = Date.now();
        sendState();
        sendToast("Exported JSON");
        break;
      case "EXPORT_ALL":
        if (state.isDeprecated) break;
        state.exportState = "exported-all";
        state.lastExportedAt = Date.now();
        sendState();
        sendToast("Exported JSON");
        break;
      case "GENERATE_VARIANTS":
        state.isGenerating = true;
        state.exportState = "idle";
        sendState();
        const genPayload = buildVariantsOnly(state);
        if (!genPayload) {
          sendError("No template content found.");
          state.isGenerating = false;
          sendState();
          break;
        }
        const signature = `${state.selectedTemplateId}|${genPayload.locale}|${genPayload.tone}`;
        state.generated = {
          templateId: state.selectedTemplateId,
          templateName: genPayload.templateName,
          locale: genPayload.locale,
          tone: genPayload.tone,
          variants: genPayload.variants,
          generatedAt: Date.now(),
          signature
        };
        if (state.selectedVariants.length === 0) {
          state.selectedVariants = [RECOMMENDED_VARIANT];
        }
        state.isGenerating = false;
        await saveState(state);
        sendState();
        sendToast("Variants generated.");
        maybeAutoSyncLibrary("GENERATE_VARIANTS");
        break;
      case "INSERT_TO_CANVAS": {
        state.exportState = "idle";
        const effectiveLocale = getEffectiveLocale(state);
        const currentSignature = `${state.selectedTemplateId}|${effectiveLocale}|${state.tone}`;
        let payload = null;
        const g = state.generated;
        if (g && g.signature === currentSignature) {
          payload = { templateName: g.templateName, locale: g.locale, tone: g.tone, layoutMode: state.layoutMode, previewDevice: state.previewDevice, variants: g.variants };
        }
        if (!payload) payload = buildVariantsOnly(state);
        if (!payload) {
          sendError("No template content found.");
          break;
        }
        state.isGenerating = true;
        sendState();
        try {
          await insertVariantsToCanvas(payload, state.selectedVariants);
          if (!g || g.signature !== currentSignature) {
            state.generated = {
              templateId: state.selectedTemplateId,
              templateName: payload.templateName,
              locale: payload.locale,
              tone: payload.tone,
              variants: payload.variants,
              generatedAt: Date.now(),
              signature: `${state.selectedTemplateId}|${payload.locale}|${payload.tone}`
            };
            await saveState(state);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          sendToast("Insert failed. Check the console for details.");
          console.error("Insert to canvas failed:", message, err, {
            templateName: payload.templateName,
            locale: payload.locale,
            tone: payload.tone,
            layoutMode: payload.layoutMode,
            previewDevice: payload.previewDevice,
            selectedVariants: state.selectedVariants
          });
        } finally {
          state.isGenerating = false;
          sendState();
        }
        break;
      }
      case "TOGGLE_BASE_TEMPLATE":
        state.isBaseTemplate = !state.isBaseTemplate;
        await saveState(state);
        sendState();
        break;
      case "DUPLICATE_TEMPLATE": {
        const sourceId = state.selectedTemplateId;
        const sourceTemplate = getTemplateById(state, sourceId);
        if (!sourceTemplate) break;
        const newId = `custom-${Date.now()}`;
        const displayName = (_b = (_a = sourceTemplate.name["en-US"]) != null ? _a : sourceTemplate.name[state.locale]) != null ? _b : String(sourceId);
        const nameForLocales = __spreadValues({}, sourceTemplate.name);
        for (const k of Object.keys(nameForLocales)) {
          nameForLocales[k] = `${displayName} (copy)`;
        }
        const newTemplate = {
          id: newId,
          name: nameForLocales,
          description: __spreadValues({}, sourceTemplate.description),
          intent: sourceTemplate.intent
        };
        state.templateCatalog = [newTemplate, ...state.templateCatalog];
        state.selectedTemplateId = newId;
        state.isBaseTemplate = false;
        state.exportState = "idle";
        state.generated = void 0;
        if (isCustomTemplateId(sourceId)) {
          const sourceContent = state.customTemplatesContent[sourceId];
          if (sourceContent) {
            const localesCopy = {};
            for (const [loc, entry] of Object.entries(sourceContent.locales)) {
              localesCopy[loc] = {
                tone: entry.tone,
                variants: {
                  A: __spreadValues({}, entry.variants.A),
                  B: __spreadValues({}, entry.variants.B),
                  C: __spreadValues({}, entry.variants.C)
                },
                status: entry.status
              };
            }
            state.customTemplatesContent = __spreadProps(__spreadValues({}, state.customTemplatesContent), {
              [newId]: { baseLocale: sourceContent.baseLocale, locales: localesCopy }
            });
          }
        } else {
          const baseContent = getSystemEmailContent({ templateId: sourceId, locale: state.locale, tone: state.tone, variant: "B" });
          const baseLocale = state.locale;
          state.customTemplatesContent = __spreadProps(__spreadValues({}, state.customTemplatesContent), {
            [newId]: {
              baseLocale,
              locales: {
                [baseLocale]: {
                  tone: state.tone,
                  variants: { A: __spreadValues({}, baseContent), B: __spreadValues({}, baseContent), C: __spreadValues({}, baseContent) },
                  status: "auto"
                }
              }
            }
          });
        }
        await saveState(state);
        sendState();
        sendToast("Template duplicated.");
        maybeAutoSyncLibrary("DUPLICATE_TEMPLATE");
        break;
      }
      case "RENAME_TEMPLATE": {
        const name = typeof m.name === "string" ? m.name.trim() : "";
        if (!name) break;
        const tid = state.selectedTemplateId;
        const t = state.templateCatalog.find((x) => x.id === tid);
        if (!t) break;
        for (const loc of Object.keys(t.name)) {
          t.name[loc] = name;
        }
        state.templateCatalog = [...state.templateCatalog];
        await saveState(state);
        sendState();
        sendToast("Template renamed.");
        maybeAutoSyncLibrary("RENAME_TEMPLATE");
        break;
      }
      case "DELETE_TEMPLATE": {
        const tid = state.selectedTemplateId;
        if (!tid) break;
        const idx = state.templateCatalog.findIndex((x) => x.id === tid);
        if (idx < 0) break;
        state.templateCatalog = state.templateCatalog.filter((x) => x.id !== tid);
        if (isCustomTemplateId(tid)) {
          const _c = state.customTemplatesContent, { [tid]: _ } = _c, rest = __objRest(_c, [__restKey(tid)]);
          state.customTemplatesContent = rest;
        }
        state.generated = void 0;
        if (state.templateCatalog.length === 0) {
          state.selectedTemplateId = "";
        } else {
          const nextIndex = Math.min(idx, state.templateCatalog.length - 1);
          state.selectedTemplateId = state.templateCatalog[nextIndex].id;
        }
        state.isBaseTemplate = state.templateCatalog.some((x) => x.id === state.selectedTemplateId);
        state.isDeprecated = false;
        await saveState(state);
        sendState();
        sendToast("Template deleted.");
        maybeAutoSyncLibrary("DELETE_TEMPLATE");
        break;
      }
      case "MARK_DEPRECATED":
        state.isDeprecated = true;
        state.exportState = "idle";
        await saveState(state);
        sendState();
        sendToast("Marked as deprecated.");
        maybeAutoSyncLibrary("MARK_DEPRECATED");
        break;
      case "RESET_STORAGE":
        if (!DEV_RESET_STORAGE_ENABLED) break;
        state = getDefaultState();
        await saveState(state);
        sendState();
        sendToast("Storage reset.");
        break;
      case "CREATE_TRANSLATION": {
        const { templateId, targetLocale } = m;
        if (!templateId || !String(templateId).startsWith("custom-")) break;
        const content = state.customTemplatesContent[templateId];
        if (!content) break;
        const source = content.locales[content.baseLocale];
        if (!source) break;
        const locales = __spreadValues({}, content.locales);
        locales[targetLocale] = { tone: source.tone, variants: { A: __spreadValues({}, source.variants.A), B: __spreadValues({}, source.variants.B), C: __spreadValues({}, source.variants.C) }, status: "auto" };
        state.customTemplatesContent = __spreadProps(__spreadValues({}, state.customTemplatesContent), { [templateId]: __spreadProps(__spreadValues({}, content), { locales }) });
        await saveState(state);
        sendState();
        sendToast(`Translation added for ${targetLocale}.`);
        maybeAutoSyncLibrary("CREATE_TRANSLATION");
        break;
      }
      case "SELECT_TEMPLATE_LOCALE": {
        const { templateId, locale } = m;
        if (!templateId || !String(templateId).startsWith("custom-") || templateId !== state.selectedTemplateId) break;
        state.templates = __spreadProps(__spreadValues({}, state.templates), { selectedTemplateLocale: locale });
        state.generated = void 0;
        await saveState(state);
        sendState();
        break;
      }
      case "IMPORT_TRANSLATIONS": {
        let flatKeysToEmailContent = function(flat) {
          var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k2, _l2, _m2;
          const title = (_b2 = (_a2 = flat["email.title"]) != null ? _a2 : flat["title"]) != null ? _b2 : "";
          const heading = (_d2 = (_c2 = flat["email.heading"]) != null ? _c2 : flat["heading"]) != null ? _d2 : "";
          const bodyPrimary = (_f2 = (_e2 = flat["email.body.primary"]) != null ? _e2 : flat["body.primary"]) != null ? _f2 : "";
          const bodySecondary = (_h2 = (_g2 = flat["email.body.secondary"]) != null ? _g2 : flat["body.secondary"]) != null ? _h2 : "";
          const body = [bodyPrimary, bodySecondary].filter(Boolean).join("\n\n");
          const cta = (_j2 = (_i2 = flat["email.cta"]) != null ? _i2 : flat["cta"]) != null ? _j2 : "";
          const footnote = (_l2 = (_k2 = flat["email.footnote"]) != null ? _k2 : flat["footer"]) != null ? _l2 : "";
          return __spreadProps(__spreadValues({}, title && { title }), {
            greeting: heading,
            body,
            footer: footnote,
            cta,
            legalText: (_m2 = flat["legalText"]) != null ? _m2 : LEGAL_DEFAULT
          });
        };
        const { templateId: incomingTemplateId, json: jsonStr } = m;
        let data;
        try {
          data = JSON.parse(jsonStr);
        } catch (e) {
          sendToast("Invalid JSON.");
          break;
        }
        const LEGAL_DEFAULT = "Loans made or arranged pursuant to applicable law. Affirm Loan Services, LLC.";
        const shortToLocale = {
          en: "en-US",
          "en-US": "en-US",
          "en-GB": "en-GB",
          es: "es-ES",
          "es-ES": "es-ES",
          "es-MX": "es-MX",
          fr: "fr-FR",
          "fr-FR": "fr-FR",
          pl: "pl-PL",
          "pl-PL": "pl-PL"
        };
        if (data.locales && typeof data.locales === "object") {
          const localesData = data.locales;
          const displayName = (_e = (_d = data.meta) == null ? void 0 : _d.story) != null ? _e : "Imported template";
          const nameForLocales = {
            "en-US": displayName,
            "en-GB": displayName,
            "es-ES": displayName,
            "es-MX": displayName,
            "pl-PL": displayName,
            "fr-FR": displayName
          };
          const descriptionForLocales = {
            "en-US": "Custom template from import",
            "en-GB": "Custom template from import",
            "es-ES": "Plantilla personalizada desde importaci\xF3n",
            "es-MX": "Plantilla personalizada desde importaci\xF3n",
            "pl-PL": "Szablon niestandardowy z importu",
            "fr-FR": "Mod\xE8le personnalis\xE9 depuis import"
          };
          const id = `custom-${Date.now()}`;
          const newTemplate = {
            id,
            name: nameForLocales,
            description: descriptionForLocales,
            intent: "Repayments"
          };
          const locales = {};
          let firstLocale = null;
          for (const [short, flat] of Object.entries(localesData)) {
            const loc = shortToLocale[short];
            if (!loc) continue;
            const baseContent = flatKeysToEmailContent(flat);
            const variants = {
              A: __spreadValues({}, baseContent),
              B: __spreadValues({}, baseContent),
              C: __spreadValues({}, baseContent)
            };
            locales[loc] = { tone: "Neutral", variants, status: "custom" };
            if (!firstLocale) firstLocale = loc;
          }
          if (firstLocale == null || Object.keys(locales).length === 0) {
            sendToast("No supported locales found. Supported: en, es, fr, pl.");
            break;
          }
          const isCustomSelected = incomingTemplateId && String(incomingTemplateId).startsWith("custom-");
          const existingContent = isCustomSelected ? state.customTemplatesContent[incomingTemplateId] : null;
          if (isCustomSelected && existingContent) {
            const merged = __spreadValues({}, existingContent.locales);
            for (const [loc, entry] of Object.entries(locales)) {
              merged[loc] = entry;
            }
            state.customTemplatesContent = __spreadProps(__spreadValues({}, state.customTemplatesContent), {
              [incomingTemplateId]: __spreadProps(__spreadValues({}, existingContent), {
                locales: merged
              })
            });
            sendToast("Translations imported.");
          } else {
            state.templateCatalog = [newTemplate, ...state.templateCatalog];
            state.selectedTemplateId = id;
            state.isBaseTemplate = false;
            state.locale = firstLocale;
            state.templates = __spreadProps(__spreadValues({}, state.templates), { selectedTemplateLocale: firstLocale });
            state.customTemplatesContent = __spreadProps(__spreadValues({}, state.customTemplatesContent), {
              [id]: { baseLocale: firstLocale, locales }
            });
            sendToast(`Imported "${displayName}" as new template.`);
          }
          maybeAutoSyncLibrary("IMPORT_TRANSLATIONS");
        } else {
          const fields = data.fields;
          if (!fields) {
            sendToast("Import format not recognized. Use meta+locales or fields.");
            break;
          }
          if (!incomingTemplateId || !String(incomingTemplateId).startsWith("custom-")) {
            sendToast("Select a custom template first, or import a file with meta+locales.");
            break;
          }
          const content = state.customTemplatesContent[incomingTemplateId];
          if (!content) {
            sendToast("Template not found.");
            break;
          }
          const localeKey = data.sourceLocale && content.locales[data.sourceLocale] ? data.sourceLocale : content.baseLocale;
          const baseContent = {
            greeting: (_f = fields.greeting) != null ? _f : "",
            body: (_g = fields.body) != null ? _g : "",
            footer: (_h = fields.footer) != null ? _h : "",
            cta: (_i = fields.cta) != null ? _i : "",
            legalText: (_j = fields.legalText) != null ? _j : ""
          };
          const entry = (_k = content.locales[localeKey]) != null ? _k : content.locales[content.baseLocale];
          const tone = (_l = entry == null ? void 0 : entry.tone) != null ? _l : "Neutral";
          const variants = {
            A: __spreadValues({}, baseContent),
            B: __spreadValues({}, baseContent),
            C: __spreadValues({}, baseContent)
          };
          const newLocales = __spreadProps(__spreadValues({}, content.locales), {
            [localeKey]: { tone, variants, status: "custom" }
          });
          state.customTemplatesContent = __spreadProps(__spreadValues({}, state.customTemplatesContent), {
            [incomingTemplateId]: __spreadProps(__spreadValues({}, content), { locales: newLocales })
          });
          sendToast("Translations imported.");
          maybeAutoSyncLibrary("IMPORT_TRANSLATIONS");
        }
        await saveState(state);
        sendState();
        break;
      }
      case "SET_AUTO_SYNC":
        state.settings = __spreadProps(__spreadValues({}, state.settings), { autoSyncToFile: m.enabled });
        await saveState(state);
        sendState();
        break;
      case "SYNC_TO_FILE": {
        const snapshot = buildLibrarySnapshot(state);
        const stored = getStoredSnapshot();
        const ourLastSynced = (_n = (_m = state.syncMeta) == null ? void 0 : _m.lastSyncedAt) != null ? _n : "";
        if (stored.kind === "ok" && stored.snapshot.updatedAt > ourLastSynced) {
          figma.ui.postMessage({
            type: "SYNC_CONFLICT",
            remoteUpdatedAt: stored.snapshot.updatedAt,
            remoteUpdatedBy: stored.snapshot.updatedBy
          });
          break;
        }
        writeSnapshot(snapshot);
        const syncFileHash = computeLibraryHash(snapshot.templates, snapshot.customTemplatesContent);
        state.syncMeta = {
          lastSyncedAt: snapshot.updatedAt,
          lastSyncedBy: snapshot.updatedBy,
          lastFileHash: syncFileHash
        };
        console.log("[Sync] wrote snapshot");
        sendToast("Synced to file.");
        await saveState(state);
        sendState();
        break;
      }
      case "SYNC_OVERWRITE_CONFIRMED": {
        const snapshot = buildLibrarySnapshot(state);
        writeSnapshot(snapshot);
        const overwriteFileHash = computeLibraryHash(snapshot.templates, snapshot.customTemplatesContent);
        state.syncMeta = {
          lastSyncedAt: snapshot.updatedAt,
          lastSyncedBy: snapshot.updatedBy,
          lastFileHash: overwriteFileHash
        };
        console.log("[Sync] wrote snapshot (overwrite)");
        sendToast("Synced to file.");
        await saveState(state);
        sendState();
        break;
      }
      case "PULL_FROM_FILE": {
        const stored = getStoredSnapshot();
        if (stored.kind === "none") {
          sendToast("No library in file. Sync to file first.");
          break;
        }
        if (stored.kind === "invalid") {
          sendError("Invalid library data in file.");
          sendToast("Invalid library data in file.");
          break;
        }
        applyPulledSnapshot(state, stored.snapshot);
        console.log("[Sync] pulled snapshot");
        sendToast("Pulled from file.");
        await saveState(state);
        sendState();
        break;
      }
      case "DOWNLOAD_LIBRARY_JSON": {
        const format = (_o = m.format) != null ? _o : "single";
        const locales = Array.isArray(m.locales) ? m.locales : [];
        if (format === "per_locale" && locales.length > 0) {
          const files = [];
          for (const loc of locales) {
            const customFiltered = {};
            for (const [tid, content] of Object.entries(state.customTemplatesContent)) {
              const entry = content.locales[loc];
              if (entry) {
                customFiltered[tid] = {
                  baseLocale: content.baseLocale,
                  locales: { [loc]: entry }
                };
              }
            }
            const templatesFiltered = state.templateCatalog.map((t) => {
              var _a2, _b2;
              const nameVal = (_a2 = t.name) == null ? void 0 : _a2[loc];
              const descVal = (_b2 = t.description) == null ? void 0 : _b2[loc];
              return {
                id: t.id,
                name: nameVal != null ? { [loc]: nameVal } : {},
                description: descVal != null ? { [loc]: descVal } : {},
                intent: t.intent
              };
            });
            const snapshot = {
              version: 1,
              updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
              updatedBy: typeof figma.currentUser !== "undefined" && figma.currentUser != null ? (_q = (_p = figma.currentUser.name) != null ? _p : figma.currentUser.id) != null ? _q : void 0 : void 0,
              templates: templatesFiltered,
              customTemplatesContent: customFiltered
            };
            files.push({ locale: loc, json: JSON.stringify(snapshot, null, 2) });
          }
          figma.ui.postMessage({ type: "LIBRARY_JSON_FOR_DOWNLOAD_MULTI", files });
        } else {
          const snapshot = buildLibrarySnapshot(state);
          figma.ui.postMessage({
            type: "LIBRARY_JSON_FOR_DOWNLOAD",
            json: JSON.stringify(snapshot, null, 2)
          });
        }
        break;
      }
      case "COPY_VARIABLE_NAMES_DEBUG": {
        const list = await getAllVariableNamesForDump();
        const lines = list.map((r) => `${r.collection}	${r.name}	${r.id}`);
        figma.ui.postMessage({ type: "VARIABLE_NAMES_DUMP", lines });
        break;
      }
      default:
        break;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    sendError(message);
    sendToast(message);
  }
};
setTimeout(() => sendState(), 30);
