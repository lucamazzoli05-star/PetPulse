import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { LANGUAGES } from '../../lib/languages'

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('IT')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = LANGUAGES.find(l => l.code === selected)!

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
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setSelected(lang.code); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 text-left"
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1 text-gray-700">{lang.label}</span>
              {selected === lang.code && <Check size={14} className="text-primary-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
