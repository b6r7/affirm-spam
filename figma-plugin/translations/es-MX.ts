/** Static template content for es-MX (source: app i18n locales). */
import type { Tone, Variant } from '../messageTypes';
import type { TemplateContentMap } from './en-US';

export const paymentReminder: TemplateContentMap = {
  Supportive: {
    A: {
      greeting: 'Hola {name},',
      body: 'Queremos recordarte que tienes un pago próximo.',
      footer: 'Estamos para ayudarte en lo que necesites.',
      cta: 'Realizar pago',
      legalText: 'Créditos otorgados conforme a la legislación mexicana. Affirm Loan Services, LLC.',
      warning: '',
    },
    B: {
      greeting: 'Hola {name},',
      body: 'Solo un recordatorio sobre tu pago que vence próximamente.',
      footer: 'Cualquier duda, estamos a tus órdenes.',
      cta: 'Realizar pago',
      legalText: 'Créditos otorgados conforme a la legislación mexicana. Affirm Loan Services, LLC.',
      warning: '',
    },
    C: {
      greeting: 'Hola {name},',
      body: 'Te contactamos para recordarte sobre tu pago pendiente.',
      footer: 'Si necesitas ayuda, contáctanos.',
      cta: 'Realizar pago',
      legalText: 'Créditos otorgados conforme a la legislación mexicana. Affirm Loan Services, LLC.',
      warning: '',
    },
  },
  Neutral: {
    A: {
      greeting: 'Hola {name},',
      body: 'Tu pago vence pronto. Por favor realiza tu pago.',
      footer: '',
      cta: 'Realizar pago',
      legalText: 'Créditos otorgados conforme a la legislación mexicana. Affirm Loan Services, LLC.',
      warning: '',
    },
    B: {
      greeting: 'Hola {name},',
      body: 'Este es un recordatorio de tu pago próximo. Por favor complétalo a la brevedad.',
      footer: '',
      cta: 'Realizar pago',
      legalText: 'Créditos otorgados conforme a la legislación mexicana. Affirm Loan Services, LLC.',
      warning: 'Debes realizar tu pago lo antes posible.',
    },
    C: {
      greeting: 'Hola {name},',
      body: 'Tienes un pago pendiente. Por favor procésalo pronto.',
      footer: '',
      cta: 'Realizar pago',
      legalText: 'Créditos otorgados conforme a la legislación mexicana. Affirm Loan Services, LLC.',
      warning: '',
    },
  },
  Firm: {
    A: {
      greeting: 'Estimado(a) {name},',
      body: 'Tu pago está vencido. Realiza el pago de inmediato.',
      footer: '',
      cta: 'Pagar ahora',
      legalText: 'Créditos otorgados conforme a la legislación mexicana. Affirm Loan Services, LLC.',
      warning: 'Es necesario que pagues ahora.',
    },
    B: {
      greeting: 'Estimado(a) {name},',
      body: 'Acción requerida: Completa tu pago vencido ahora.',
      footer: '',
      cta: 'Pagar ahora',
      legalText: 'Créditos otorgados conforme a la legislación mexicana. Affirm Loan Services, LLC.',
      warning: 'Necesitas pagar tu saldo de inmediato.',
    },
    C: {
      greeting: 'Estimado(a) {name},',
      body: 'Pago vencido. Procesa el pago inmediatamente.',
      footer: '',
      cta: 'Pagar ahora',
      legalText: 'Créditos otorgados conforme a la legislación mexicana. Affirm Loan Services, LLC.',
      warning: 'Es necesario que realices tu pago ahora.',
    },
  },
  Educational: {
    A: {
      greeting: 'Hola {name},',
      body: 'Realizar tu pago a tiempo ayuda a mantener tu cuenta al corriente y construye un buen historial crediticio.',
      footer: '¿Tienes dudas sobre tu pago? Estamos para ayudarte.',
      cta: 'Realizar pago',
      legalText: 'Créditos otorgados conforme a la legislación mexicana. Affirm Loan Services, LLC.',
      warning: '',
    },
    B: {
      greeting: 'Hola {name},',
      body: 'Los pagos puntuales son importantes para mantener tu cuenta activa y tu calendario de pagos.',
      footer: '¿Necesitas ayuda? Contáctanos.',
      cta: 'Realizar pago',
      legalText: 'Créditos otorgados conforme a la legislación mexicana. Affirm Loan Services, LLC.',
      warning: '',
    },
    C: {
      greeting: 'Hola {name},',
      body: 'Los pagos regulares te ayudan a completar tu crédito exitosamente y mejoran tu perfil crediticio.',
      footer: '¿Preguntas? Estamos disponibles.',
      cta: 'Realizar pago',
      legalText: 'Créditos otorgados conforme a la legislación mexicana. Affirm Loan Services, LLC.',
      warning: '',
    },
  },
};
