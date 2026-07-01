import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeartPulse, Plus, ChevronRight, Stethoscope, Info, LogOut, TriangleAlert } from 'lucide-react'
import { usePets } from '../hooks/usePets'
import { useAuth } from '../context/AuthContext'
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

export default function HomePage() {
  const navigate = useNavigate()
  const { pets, loading } = usePets()
  const { user, signOut } = useAuth()
  const { t, lang } = useLang()
  const [profile, setProfile] = useState<'owner' | null>(null)
  const [infoSeen, setInfoSeen] = useState(() => localStorage.getItem('profileInfoSeen') === '1')
  const [showConfirmed, setShowConfirmed] = useState(false)

  useEffect(() => {
    if (window.location.hash.includes('type=signup')) {
      setShowConfirmed(true)
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const userName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? ''

  function openEmergency() {
    window.open('https://maps.google.com/?q=veterinario+di+guardia+vicino+a+me', '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <LanguageSwitcher />
          <div className="flex items-center gap-2">
            <button
              onClick={openEmergency}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: '#FCEBEB', color: '#B42318', border: '1px solid #F3C6C4' }}
            >
              <TriangleAlert size={15} />
              {t('emergency')}
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
        <h1 className="text-[22px] font-medium text-gray-900">{t('homeGreeting')} {userName},</h1>
        <p className="text-[15px] text-gray-500 mt-0.5 mb-5">{t('homeSubtitle')}</p>

        {/* Scelta profilo */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setProfile('owner'); setInfoSeen(true); localStorage.setItem('profileInfoSeen', '1') }}
            className={`text-left p-4 rounded-2xl border bg-white transition-all ${
              profile === 'owner' ? 'border-primary-400 ring-2 ring-primary-100' : 'border-gray-100'
            }`}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: '#E1F5EE' }}
            >
              <HeartPulse size={20} style={{ color: '#0F6E56' }} />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{t('homeMyPets')}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t('homeOwner')}</p>
          </button>

          <div className="text-left p-4 rounded-2xl border border-gray-100 bg-white opacity-55 cursor-not-allowed">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: '#E6F1FB' }}
            >
              <Stethoscope size={20} style={{ color: '#185FA5' }} />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{t('homeVet')}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t('homeVetSoon')}</p>
          </div>
        </div>

        {/* Nota informativa */}
        {!infoSeen && (
          <div className="flex items-start gap-2 bg-white border border-gray-100 rounded-xl p-3 mt-4">
            <Info size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500">{t('homeInfoNote')}</p>
          </div>
        )}

        {/* Lista animali */}
        {profile === 'owner' && (
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
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : pets.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🐾</div>
                <p className="text-gray-600 font-medium">{t('homeNoPets')}</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">{t('homeNoPetsDesc')}</p>
                <button onClick={() => navigate('/new-pet')} className="btn-primary text-sm">
                  {t('homeAddPet')}
                </button>
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
      </div>
    </div>
  )
}
