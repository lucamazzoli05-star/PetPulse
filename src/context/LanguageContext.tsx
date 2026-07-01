import { createContext, useContext, useState, type ReactNode } from 'react'
import { type Lang, translations, type TranslationKey } from '../lib/translations'

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) ?? 'IT'
  })

  function changeLang(l: Lang) {
    setLang(l)
    localStorage.setItem('lang', l)
  }

  function t(key: TranslationKey): string {
    return translations[key][lang]
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
