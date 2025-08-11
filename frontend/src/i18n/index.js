import { createI18n } from 'vue-i18n'

// Import language files
import en from './locales/en.json'
import ko from './locales/ko.json'

// Get saved language from localStorage or default to browser language
const savedLanguage = localStorage.getItem('language')
const browserLanguage = navigator.language.split('-')[0]
const defaultLanguage = savedLanguage || (browserLanguage === 'ko' ? 'ko' : 'en')

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: defaultLanguage,
  fallbackLocale: 'en',
  messages: {
    en,
    ko
  },
  // Number and date formatting
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
        currency: 'USD'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      }
    },
    ko: {
      currency: {
        style: 'currency',
        currency: 'KRW'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      }
    }
  },
  datetimeFormats: {
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric'
      }
    },
    ko: {
      short: {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric'
      }
    }
  }
})

// Save language preference when it changes
i18n.global.locale = new Proxy(i18n.global.locale, {
  set(target, property, value) {
    if (property === 'value') {
      localStorage.setItem('language', value)
      // Set document language for accessibility
      document.documentElement.lang = value
    }
    return Reflect.set(target, property, value)
  }
})

// Set initial document language
document.documentElement.lang = defaultLanguage

export default i18n