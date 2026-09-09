// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to MediWise',
      logout: 'Sign Out',
      // Add more keys as needed
    },
  },
  hi: {
    translation: {
      welcome: 'MediWise में आपका स्वागत है',
      logout: 'साइन आउट',
    },
  },
  ta: {
    translation: {
      welcome: 'MediWise-க்கு வரவேற்கிறோம்',
      logout: 'வெளியேறு',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
