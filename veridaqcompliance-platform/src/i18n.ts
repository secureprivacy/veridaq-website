import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    debug: false,
    lng: 'en', // Default language, will be overridden by App.tsx

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}',
    },

    ns: ['common', 'header', 'hero', 'features', 'industries', 'benefits', 'compliance', 'contact', 'footer', 'seo', 'trustSignals', 'roiCalculator', 'liveChat', 'scrollCTA', 'complianceChecklist', 'localization', 'blog'],
    defaultNS: 'common',

    supportedLngs: [
      'en', 'en-US', 'en-GB',
      'da', 'da-DK',
      'sv', 'sv-SE',
      'no', 'no-NO',
      'fi', 'fi-FI',
      'de', 'de-DE', 'de-AT', 'de-CH',
      'fr', 'fr-FR', 'fr-BE', 'fr-CH',
      'es', 'es-ES',
      'it', 'it-IT',
      'pt', 'pt-PT',
      'nl', 'nl-NL', 'nl-BE'
    ],

    fallbackLng: {
      'en-US': ['en'],
      'en-GB': ['en'],
      'da-DK': ['da'],
      'sv-SE': ['sv'],
      'no-NO': ['no'],
      'fi-FI': ['fi'],
      'de-DE': ['de'],
      'de-AT': ['de'],
      'de-CH': ['de'],
      'fr-FR': ['fr'],
      'fr-BE': ['fr'],
      'fr-CH': ['fr'],
      'es-ES': ['es'],
      'it-IT': ['it'],
      'pt-PT': ['pt'],
      'nl-NL': ['nl'],
      'nl-BE': ['nl'],
      'default': ['en']
    },
  });

export default i18n;