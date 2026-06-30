export interface Language {
  code: string
  label: string
  flag: string
}

export const LANGUAGES: Language[] = [
  { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'ZH', label: '中文', flag: '🇨🇳' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
  { code: 'HI', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'AR', label: 'العربية', flag: '🇸🇦' },
  { code: 'PT', label: 'Português', flag: '🇵🇹' },
  { code: 'RU', label: 'Русский', flag: '🇷🇺' },
  { code: 'JA', label: '日本語', flag: '🇯🇵' },
  { code: 'FR', label: 'Français', flag: '🇫🇷' },
]
