import { useEffect, useState } from 'react'
import { translations } from './translations.js'
import { DEFAULT_LANG, I18nContext } from './context.js'

function langFromLocale(locale) {
  const primary = (locale || '').split('-')[0].toLowerCase()
  if (primary === 'fr') return 'fr'
  if (primary === 'es') return 'es'
  return DEFAULT_LANG
}

export function I18nProvider({ children }) {
  const [lang] = useState(() => {
    if (typeof navigator === 'undefined') return DEFAULT_LANG
    return langFromLocale(navigator.language)
  })

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return <I18nContext.Provider value={{ lang, t: translations[lang] }}>{children}</I18nContext.Provider>
}
