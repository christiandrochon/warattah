import { createContext, useContext } from 'react'
import { translations } from './translations.js'

export const DEFAULT_LANG = 'en'

export const I18nContext = createContext({
  lang: DEFAULT_LANG,
  t: translations[DEFAULT_LANG],
})

export function useI18n() {
  return useContext(I18nContext)
}
