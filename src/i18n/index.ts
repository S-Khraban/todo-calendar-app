import { createI18n } from 'vue-i18n'

import en from './locales/en.json'
import uk from './locales/uk.json'

const LOCALE_KEY = 'todo_locale'

const saved = localStorage.getItem(LOCALE_KEY) || 'en'

export const i18n = createI18n({
  legacy: false,
  locale: saved,
  fallbackLocale: 'en',
  messages: { en, uk },
})

export const setLocale = (locale: 'en' | 'uk') => {
  i18n.global.locale.value = locale
  localStorage.setItem(LOCALE_KEY, locale)
  document.documentElement.lang = locale
}
