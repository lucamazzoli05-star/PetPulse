import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { LANGUAGES } from '../../lib/languages'
import { useLang } from '../../context/LanguageContext'
import { type Lang } from '../../lib/translations'

const SUPPORTED: string[] = ['IT', 'EN']

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = LANGUAGES.find(l => l.code === lang)!

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Globe size={15} className="text-gray-500" />
        {current.code}
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-50 max-h-72 overflow-y-auto">
          {LANGUAGES.map(l => {
            const supported = SUPPORTED.includes(l.code)
            return (
              <button
                key={l.code}
                onClick={() => {
                  if (supported) { setLang(l.code as Lang); setOpen(false) }
                }}
                disabled={!supported}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                  supported ? 'hover:bg-gray-50 text-gray-700' : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {!supported && <span className="text-[10px] text-gray-300">soon</span>}
                {supported && lang === l.code && <Check size={14} className="text-primary-600" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
