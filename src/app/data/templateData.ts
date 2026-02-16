import { Locale } from './contentData';

export type TemplateType = string;

export function isCustomTemplateId(id: TemplateType): boolean {
  return String(id).startsWith('custom-');
}

export interface TemplateInfo {
  id: TemplateType;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  intent: string;
}

/** Demo template seeded so the web app is usable on first load. */
const DEMO_TEMPLATE: TemplateInfo = {
  id: 'demo',
  name: {
    'en-US': 'Demo template',
    'en-GB': 'Demo template',
    'es-ES': 'Plantilla de demostración',
    'es-MX': 'Plantilla de demostración',
    'pl-PL': 'Szablon demo',
    'fr-FR': 'Modèle de démonstration',
  },
  description: {
    'en-US': 'Sample email for trying the app',
    'en-GB': 'Sample email for trying the app',
    'es-ES': 'Correo de ejemplo para probar la aplicación',
    'es-MX': 'Correo de ejemplo para probar la aplicación',
    'pl-PL': 'Przykładowy e-mail do wypróbowania aplikacji',
    'fr-FR': 'Exemple d\'email pour essayer l\'application',
  },
  intent: 'Repayments',
};

export const templates: TemplateInfo[] = [
  DEMO_TEMPLATE,
  {
    id: 'payment-reminder',
    name: {
      'en-US': 'Payment reminder',
      'en-GB': 'Payment reminder',
      'es-ES': 'Recordatorio de pago',
      'es-MX': 'Recordatorio de pago',
      'pl-PL': 'Przypomnienie o płatności',
      'fr-FR': 'Rappel de paiement',
    },
    description: {
      'en-US': 'Standard reminder for upcoming payment',
      'en-GB': 'Standard reminder for upcoming payment',
      'es-ES': 'Recordatorio estándar para pago próximo',
      'es-MX': 'Recordatorio estándar para pago próximo',
      'pl-PL': 'Standardowe przypomnienie o zbliżającej się płatności',
      'fr-FR': 'Rappel standard pour paiement à venir',
    },
    intent: 'Repayments',
  },
  {
    id: 'primary-delinquency',
    name: {
      'en-US': 'Primary delinquency reminder',
      'en-GB': 'Primary delinquency reminder',
      'es-ES': 'Recordatorio de morosidad primaria',
      'es-MX': 'Recordatorio de atraso inicial',
      'pl-PL': 'Przypomnienie o zaległości podstawowej',
      'fr-FR': 'Rappel de défaut de paiement principal',
    },
    description: {
      'en-US': 'First notice for overdue payment',
      'en-GB': 'First notice for overdue payment',
      'es-ES': 'Primera notificación de pago vencido',
      'es-MX': 'Primera notificación de pago vencido',
      'pl-PL': 'Pierwsze powiadomienie o zaległej płatności',
      'fr-FR': 'Premier avis de paiement en retard',
    },
    intent: 'Collections',
  },
  {
    id: 'upcoming-payment',
    name: {
      'en-US': 'Upcoming payment notice',
      'en-GB': 'Upcoming payment notice',
      'es-ES': 'Aviso de pago próximo',
      'es-MX': 'Aviso de pago próximo',
      'pl-PL': 'Informacja o nadchodzącej płatności',
      'fr-FR': 'Avis de paiement à venir',
    },
    description: {
      'en-US': 'Advance notice for payment due in 3-5 days',
      'en-GB': 'Advance notice for payment due in 3-5 days',
      'es-ES': 'Aviso anticipado para pago en 3-5 días',
      'es-MX': 'Aviso anticipado para pago en 3-5 días',
      'pl-PL': 'Wcześniejsze powiadomienie o płatności w ciągu 3-5 dni',
      'fr-FR': 'Préavis pour paiement dû dans 3 à 5 jours',
    },
    intent: 'Repayments',
  },
  {
    id: 'pre-due-reminder',
    name: {
      'en-US': 'Pre-due reminder',
      'en-GB': 'Pre-due reminder',
      'es-ES': 'Recordatorio previo al vencimiento',
      'es-MX': 'Recordatorio previo al vencimiento',
      'pl-PL': 'Przypomnienie przed terminem',
      'fr-FR': 'Rappel avant échéance',
    },
    description: {
      'en-US': 'Gentle reminder sent 7 days before due date',
      'en-GB': 'Gentle reminder sent 7 days before due date',
      'es-ES': 'Recordatorio suave enviado 7 días antes',
      'es-MX': 'Recordatorio amable enviado 7 días antes',
      'pl-PL': 'Delikatne przypomnienie wysłane 7 dni wcześniej',
      'fr-FR': 'Rappel envoyé 7 jours avant la date limite',
    },
    intent: 'Repayments',
  },
  {
    id: 'missed-payment',
    name: {
      'en-US': 'Missed payment follow-up',
      'en-GB': 'Missed payment follow-up',
      'es-ES': 'Seguimiento de pago perdido',
      'es-MX': 'Seguimiento de pago perdido',
      'pl-PL': 'Kontynuacja w sprawie pominiętej płatności',
      'fr-FR': 'Suivi de paiement manqué',
    },
    description: {
      'en-US': 'Follow-up after missed payment deadline',
      'en-GB': 'Follow-up after missed payment deadline',
      'es-ES': 'Seguimiento después de fecha límite',
      'es-MX': 'Seguimiento después de fecha límite',
      'pl-PL': 'Kontynuacja po terminie płatności',
      'fr-FR': 'Suivi après échéance manquée',
    },
    intent: 'Collections',
  },
  {
    id: 'post-due-soft',
    name: {
      'en-US': 'Post-due, softer tone',
      'en-GB': 'Post-due, softer tone',
      'es-ES': 'Post-vencimiento, tono más suave',
      'es-MX': 'Post-vencimiento, tono más suave',
      'pl-PL': 'Po terminie, łagodniejszy ton',
      'fr-FR': 'Après échéance, ton plus doux',
    },
    description: {
      'en-US': 'Supportive message for late payment',
      'en-GB': 'Supportive message for late payment',
      'es-ES': 'Mensaje de apoyo para pago tardío',
      'es-MX': 'Mensaje de apoyo para pago tardío',
      'pl-PL': 'Wspierająca wiadomość o spóźnionej płatności',
      'fr-FR': 'Message de soutien pour paiement en retard',
    },
    intent: 'Collections',
  },
  {
    id: 'payment-plan-update',
    name: {
      'en-US': 'Payment plan update',
      'en-GB': 'Payment plan update',
      'es-ES': 'Actualización del plan de pagos',
      'es-MX': 'Actualización del plan de pagos',
      'pl-PL': 'Aktualizacja planu płatności',
      'fr-FR': 'Mise à jour du plan de paiement',
    },
    description: {
      'en-US': 'Informational update about payment schedule',
      'en-GB': 'Informational update about payment schedule',
      'es-ES': 'Actualización informativa sobre calendario de pagos',
      'es-MX': 'Actualización informativa sobre calendario de pagos',
      'pl-PL': 'Informacyjna aktualizacja harmonogramu płatności',
      'fr-FR': 'Mise à jour informative sur le calendrier de paiement',
    },
    intent: 'Account updates',
  },
  {
    id: 'educational',
    name: {
      'en-US': 'Educational reminder',
      'en-GB': 'Educational reminder',
      'es-ES': 'Recordatorio educativo',
      'es-MX': 'Recordatorio educativo',
      'pl-PL': 'Przypomnienie edukacyjne',
      'fr-FR': 'Rappel éducatif',
    },
    description: {
      'en-US': 'Explains importance of timely payments',
      'en-GB': 'Explains importance of timely payments',
      'es-ES': 'Explica la importancia de los pagos puntuales',
      'es-MX': 'Explica la importancia de los pagos puntuales',
      'pl-PL': 'Wyjaśnia znaczenie terminowych płatności',
      'fr-FR': 'Explique l\'importance des paiements ponctuels',
    },
    intent: 'Education',
  },
];

export function getTemplateById(id: TemplateType): TemplateInfo | undefined {
  return templates.find(t => t.id === id);
}