import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import ruTranslation from './locales/ru.json';
import beTranslation from './locales/be.json';
import zhTranslation from './locales/zh.json';

// the translations
const resources = {
  en: {
    translation: enTranslation
  },
  ru: {
    translation: ruTranslation
  },
  be: {
    translation: beTranslation
  },
  zh: {
    translation: zhTranslation
  }
};

// Check if a language is saved in localStorage
const savedLanguage = localStorage.getItem('i18nextLng') || 'ru';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: savedLanguage, // use saved language or default to Russian
    fallbackLng: 'ru', // fallback language
    
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    
    // Have a common namespace used around the full app
    defaultNS: 'translation',
    
    // HTML detection support - important for applying to HTML elements
    react: { 
      transSupportBasicHtmlNodes: true, // allow <br/> and similar HTML in translations
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'em', 'span'] // don't convert these HTML elements
    }
  });

// Set the lang attribute on the html element when i18next is initialized
document.documentElement.lang = i18n.language;

// Listen for language changes and update the lang attribute
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  
  // Save the selected language to localStorage
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
