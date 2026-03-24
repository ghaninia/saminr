import { createContext, useContext, useState, useEffect } from 'react'
import faTranslations from '../translations/fa.json'
import enTranslations from '../translations/en.json'

const LanguageContext = createContext()

const translations = {
  fa: faTranslations,
  en: enTranslations
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Load from localStorage or default to 'fa'
    return localStorage.getItem('language') || 'fa'
  })

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem('language', language)

    // Keep document language and direction in sync with selected language.
    const dir = language === 'fa' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('lang', language)
    document.documentElement.setAttribute('dir', dir)
  }, [language])

  const changeLanguage = (lang) => {
    setLanguage(lang)
  }

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

