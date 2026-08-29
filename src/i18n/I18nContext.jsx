import { useEffect, useState } from 'react'
import { translations } from './translations.js'
import { DEFAULT_LANG, I18nContext } from './context.js'

const CACHE_KEY = 'warattah_geo_lang'

const FRENCH_COUNTRY_CODES = new Set(['FR', 'NC', 'PF', 'WF', 'BE', 'CH', 'MC'])

function langFromCountry(countryCode) {
  if (FRENCH_COUNTRY_CODES.has(countryCode)) return 'fr'
  if (countryCode === 'ES') return 'es'
  return DEFAULT_LANG
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      return cached && translations[cached] ? cached : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (lang) return

    let cancelled = false

    fetch('https://ipapi.co/json/', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('geo lookup failed')
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        const detected = langFromCountry((data && data.country_code) || '')
        try {
          sessionStorage.setItem(CACHE_KEY, detected)
        } catch {
          /* sessionStorage unavailable — in-memory only for this load */
        }
        setLang(detected)
      })
      .catch(() => {
        if (!cancelled) setLang(DEFAULT_LANG)
      })

    return () => {
      cancelled = true
    }
  }, [lang])

  const resolvedLang = lang || DEFAULT_LANG

  useEffect(() => {
    document.documentElement.lang = resolvedLang
  }, [resolvedLang])

  return (
    <I18nContext.Provider value={{ lang: resolvedLang, t: translations[resolvedLang] }}>
      {children}
    </I18nContext.Provider>
  )
}
