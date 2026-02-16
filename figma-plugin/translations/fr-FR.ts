/** Static template content for fr-FR (source: app i18n locales). */
import type { Tone, Variant } from '../messageTypes';
import type { TemplateContentMap } from './en-US';

export const paymentReminder: TemplateContentMap = {
  Supportive: {
    A: {
      greeting: 'Bonjour {name},',
      body: 'Nous souhaitons vous rappeler que votre paiement arrive à échéance prochainement.',
      footer: 'Nous sommes là pour vous aider si besoin.',
      cta: 'Effectuer un paiement',
      legalText: 'Prêts accordés conformément à la réglementation française du crédit à la consommation. Affirm Loan Services, LLC.',
      warning: '',
    },
    B: {
      greeting: 'Bonjour {name},',
      body: 'Juste un rappel amical concernant votre prochain paiement.',
      footer: "N'hésitez pas à nous contacter si vous avez des questions.",
      cta: 'Effectuer un paiement',
      legalText: 'Prêts accordés conformément à la réglementation française du crédit à la consommation. Affirm Loan Services, LLC.',
      warning: '',
    },
    C: {
      greeting: 'Bonjour {name},',
      body: 'Nous vous contactons au sujet de votre paiement qui arrive bientôt.',
      footer: 'Nous restons à votre disposition.',
      cta: 'Effectuer un paiement',
      legalText: 'Prêts accordés conformément à la réglementation française du crédit à la consommation. Affirm Loan Services, LLC.',
      warning: '',
    },
  },
  Neutral: {
    A: {
      greeting: 'Bonjour {name},',
      body: 'Votre paiement arrive à échéance prochainement. Veuillez procéder au paiement.',
      footer: '',
      cta: 'Effectuer un paiement',
      legalText: 'Prêts accordés conformément à la réglementation française du crédit à la consommation. Affirm Loan Services, LLC.',
      warning: '',
    },
    B: {
      greeting: 'Bonjour {name},',
      body: 'Ceci est un rappel concernant votre paiement à venir. Veuillez le compléter dès que possible.',
      footer: '',
      cta: 'Effectuer un paiement',
      legalText: 'Prêts accordés conformément à la réglementation française du crédit à la consommation. Affirm Loan Services, LLC.',
      warning: '',
    },
    C: {
      greeting: 'Bonjour {name},',
      body: 'Vous avez un paiement en attente. Veuillez le traiter prochainement.',
      footer: '',
      cta: 'Effectuer un paiement',
      legalText: 'Prêts accordés conformément à la réglementation française du crédit à la consommation. Affirm Loan Services, LLC.',
      warning: '',
    },
  },
  Firm: {
    A: {
      greeting: 'Madame, Monsieur {name},',
      body: 'Votre paiement est en retard. Veuillez effectuer le paiement immédiatement.',
      footer: '',
      cta: 'Payer maintenant',
      legalText: 'Prêts accordés conformément à la réglementation française du crédit à la consommation. Affirm Loan Services, LLC.',
      warning: '',
    },
    B: {
      greeting: 'Madame, Monsieur {name},',
      body: 'Action requise : Complétez votre paiement en retard maintenant.',
      footer: '',
      cta: 'Payer maintenant',
      legalText: 'Prêts accordés conformément à la réglementation française du crédit à la consommation. Affirm Loan Services, LLC.',
      warning: '',
    },
    C: {
      greeting: 'Madame, Monsieur {name},',
      body: 'Paiement en retard. Veuillez traiter le paiement immédiatement.',
      footer: '',
      cta: 'Payer maintenant',
      legalText: 'Prêts accordés conformément à la réglementation française du crédit à la consommation. Affirm Loan Services, LLC.',
      warning: '',
    },
  },
  Educational: {
    A: {
      greeting: 'Bonjour {name},',
      body: 'Effectuer votre paiement à temps aide à maintenir votre compte en règle et contribue à construire un historique de paiement positif.',
      footer: 'Des questions sur votre paiement ? Nous sommes là pour vous aider.',
      cta: 'Effectuer un paiement',
      legalText: 'Prêts accordés conformément à la réglementation française du crédit à la consommation. Affirm Loan Services, LLC.',
      warning: '',
    },
    B: {
      greeting: 'Bonjour {name},',
      body: "Les paiements ponctuels sont importants pour maintenir votre compte actif et respecter votre calendrier de remboursement.",
      footer: "Besoin d'aide ? Contactez-nous.",
      cta: 'Effectuer un paiement',
      legalText: 'Prêts accordés conformément à la réglementation française du crédit à la consommation. Affirm Loan Services, LLC.',
      warning: '',
    },
    C: {
      greeting: 'Bonjour {name},',
      body: 'Des paiements réguliers vous aident à compléter votre prêt avec succès et peuvent impacter positivement votre profil de crédit.',
      footer: 'Questions ? Nous sommes disponibles.',
      cta: 'Effectuer un paiement',
      legalText: 'Prêts accordés conformément à la réglementation française du crédit à la consommation. Affirm Loan Services, LLC.',
      warning: '',
    },
  },
};
