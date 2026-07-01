import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeartPulse, Plus, ChevronRight, Stethoscope, LogOut, TriangleAlert, Settings, Check, X } from 'lucide-react'
import { usePets } from '../hooks/usePets'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useLang } from '../context/LanguageContext'
import Spinner from '../components/ui/Spinner'
import LanguageSwitcher from '../components/layout/LanguageSwitcher'
import { SPECIES_EMOJI, translateSpecies } from '../lib/species'
import { type TranslationKey } from '../lib/translations'

function petAge(birthDate: string | null, t: (k: TranslationKey) => string): string {
  if (!birthDate) return ''
  const diff = Date.now() - new Date(birthDate).getTime()
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44))
  if (years >= 1) return `${years} ${years === 1 ? t('ageYearSingular') : t('ageYearPlural')}`
  if (months >= 1) return `${months} ${months === 1 ? t('ageMonthSingular') : t('ageMonthPlural')}`
  return t('ageLessThanMonth')
}

function getProfilesFromUser(user: ReturnType<typeof useAuth>['user']): string[] {
  const meta = user?.user_metadata?.profiles
  if (Array.isArray(meta) && meta.length > 0) return meta
  // fallback to old single-profile format
  if (user?.user_metadata?.profile === 'owner') return ['owner']
  if (localStorage.getItem('selectedProfile') === 'owner') return ['owner']
  return []
}

function saveProfiles(profiles: string[]) {
  supabase.auth.updateUser({ data: { profiles, profile: profiles.includes('owner') ? 'owner' : null } })
  localStorage.setItem('selectedProfile', profiles.includes('owner') ? 'owner' : '')
}

export default function HomePage() {
  const navigate = useNavigate()
  const { pets, loading } = usePets()
  const { user, signOut } = useAuth()
  const { t, lang } = useLang()

  const [profiles, setProfiles] = useState<string[]>(() => getProfilesFromUser(user))
  const [showConfirmed, setShowConfirmed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsProfiles, setSettingsProfiles] = useState<string[]>([])

  useEffect(() => {
    if (window.location.hash.includes('type=signup')) {
      setShowConfirmed(true)
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const userName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? ''

  const hasChosen = profiles.length > 0
  const isOwner = profiles.includes('owner')
  const isVet = profiles.includes('vet')

  function chooseProfile(role: string) {
    const updated = [role]
    setProfiles(updated)
    saveProfiles(updated)
  }

  function openSettings() {
    setSettingsProfiles([...profiles])
    setShowSettings(true)
  }

  function toggleSettingsProfile(role: string) {
    setSettingsProfiles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  function saveSettings() {
    setProfiles(settingsProfiles)
    saveProfiles(settingsProfiles)
    setShowSettings(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <LanguageSwitcher />
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('https://maps.google.com/?q=veterinario+di+guardia+vicino+a+me', '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: '#FCEBEB', color: '#B42318', border: '1px solid #F3C6C4' }}
            >
              <TriangleAlert size={15} />
              {t('emergency')}
            </button>
            <button onClick={openSettings} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
              <Settings size={16} />
            </button>
            <button onClick={signOut} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {showConfirmed && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <p className="text-sm text-green-700 font-medium">✅ {t('homeConfirmed')}</p>
            <button onClick={() => setShowConfirmed(false)} className="text-green-500 text-lg leading-none ml-3">×</button>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className={`text-[22px] font-medium text-gray-900 ${hasChosen ? 'mb-5' : 'mb-0'}`}>
          {t('homeGreeting')} {userName} 👋
        </h1>

        {/* Scelta profilo iniziale */}
        {!hasChosen && (
          <>
            <p className="text-[15px] text-gray-500 mt-0.5 mb-5">{t('homeSubtitle')}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => chooseProfile('owner')}
                className="text-left p-4 rounded-2xl border border-gray-100 bg-white hover:border-primary-400 transition-all"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#E1F5EE' }}>
                  <HeartPulse size={20} style={{ color: '#0F6E56' }} />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{t('homeMyPets')}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('homeOwner')}</p>
              </button>

              <div className="text-left p-4 rounded-2xl border border-gray-100 bg-white opacity-55 cursor-not-allowed">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#E6F1FB' }}>
                  <Stethoscope size={20} style={{ color: '#185FA5' }} />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{t('homeVet')}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('homeVetSoon')}</p>
              </div>
            </div>
          </>
        )}

        {/* Lista animali */}
        {isOwner && (
          <div className="card mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HeartPulse size={18} className="text-primary-600" />
                <h2 className="font-semibold text-gray-900">{t('homeMyPets')}</h2>
              </div>
              <button
                onClick={() => navigate('/new-pet')}
                className="flex items-center gap-1 text-sm text-primary-600 font-medium hover:text-primary-700"
              >
                <Plus size={16} /> {t('add')}
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : pets.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🐾</div>
                <p className="text-gray-600 font-medium">{t('homeNoPets')}</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">{t('homeNoPetsDesc')}</p>
                <button onClick={() => navigate('/new-pet')} className="btn-primary text-sm">{t('homeAddPet')}</button>
              </div>
            ) : (
              <div className="space-y-2">
                {pets.map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => navigate(`/pet/${pet.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                      {pet.photo_url
                        ? <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                        : <span>{SPECIES_EMOJI[pet.species] ?? '🐾'}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{pet.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {translateSpecies(pet.species, lang)}{pet.breed ? ` · ${pet.breed}` : ''}{pet.birth_date ? ` · ${petAge(pet.birth_date, t)}` : ''}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sezione veterinario (coming soon) */}
        {isVet && (
          <div className="card mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope size={18} className="text-blue-500" />
              <h2 className="font-semibold text-gray-900">{t('homeVet')}</h2>
            </div>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🩺</div>
              <p className="text-gray-600 font-medium">{t('homeVetSoon')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('homeVetSoonDesc')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSettings(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{t('settingsTitle')}</h2>
              <button onClick={() => setShowSettings(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">{t('settingsProfile')}</p>
              <div className="space-y-2">
                {/* Owner card */}
                <button
                  onClick={() => toggleSettingsProfile('owner')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    settingsProfiles.includes('owner') ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E1F5EE' }}>
                    <HeartPulse size={18} style={{ color: '#0F6E56' }} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${settingsProfiles.includes('owner') ? 'text-primary-700' : 'text-gray-800'}`}>{t('homeMyPets')}</p>
                    <p className="text-xs text-gray-400">{t('homeOwner')}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    settingsProfiles.includes('owner') ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                  }`}>
                    {settingsProfiles.includes('owner') && <Check size={12} className="text-white" />}
                  </div>
                </button>

                {/* Vet card — coming soon */}
                <div className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 bg-white opacity-50 cursor-not-allowed">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E6F1FB' }}>
                    <Stethoscope size={18} style={{ color: '#185FA5' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-800">{t('homeVet')}</p>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">{t('homeVetSoon')}</span>
                    </div>
                    <p className="text-xs text-gray-400">{t('settingsVetDesc')}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={saveSettings}
                disabled={settingsProfiles.length === 0}
                className="btn-primary w-full mt-5 disabled:opacity-40"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
