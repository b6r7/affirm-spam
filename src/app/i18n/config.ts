import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUS from './locales/en-US.json';
import enGB from './locales/en-GB.json';
import esES from './locales/es-ES.json';
import esMX from './locales/es-MX.json';
import plPL from './locales/pl-PL.json';
import frFR from './locales/fr-FR.json';

const resources = {
  'en-US': { translation: enUS },
  'en-GB': { translation: enGB },
  'es-ES': { translation: esES },
  'es-MX': { translation: esMX },
  'pl-PL': { translation: plPL },
  'fr-FR': { translation: frFR },
};

i18n.use(initReactI18next).init({
  resources,
  defaultNS: 'translation',
  defaultLng: 'en-US',
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
