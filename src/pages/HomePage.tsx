// ─────────────────────────────────────────────
// HomePage.tsx — schermata principale dell'app
// Mostra il saluto, la scelta del profilo,
// la lista animali (se owner) o il bottone
// per entrare nel gestionale (se vet).
// ─────────────────────────────────────────────

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

// Calcola l'età dell'animale a partire dalla data di nascita.
// Restituisce una stringa tipo "3 anni" o "5 mesi".
function petAge(birthDate: string | null, t: (k: TranslationKey) => string): string {
  if (!birthDate) return ''
  const diff = Date.now() - new Date(birthDate).getTime() // millisecondi trascorsi dalla nascita
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44))
  if (years >= 1) return `${years} ${years === 1 ? t('ageYearSingular') : t('ageYearPlural')}`
  if (months >= 1) return `${months} ${months === 1 ? t('ageMonthSingular') : t('ageMonthPlural')}`
  return t('ageLessThanMonth')
}

// Legge i profili scelti dall'utente (es. ["owner"] o ["vet"]).
// Prima controlla i dati salvati su Supabase, poi il localStorage come fallback.
function getProfilesFromUser(user: ReturnType<typeof useAuth>['user']): string[] {
  const meta = user?.user_metadata?.profiles
  if (Array.isArray(meta) && meta.length > 0) return meta
  // vecchio formato: singolo profilo salvato come stringa
  if (user?.user_metadata?.profile === 'owner') return ['owner']
  if (localStorage.getItem('selectedProfile') === 'owner') return ['owner']
  return [] // nessun profilo ancora scelto
}

// Salva il profilo scelto in due posti:
// 1. Supabase (così si ricorda anche su altri dispositivi)
// 2. localStorage (backup locale nel browser)
function saveProfiles(profiles: string[]) {
  supabase.auth.updateUser({ data: { profiles, profile: profiles.includes('owner') ? 'owner' : null } })
  localStorage.setItem('selectedProfile', profiles.includes('owner') ? 'owner' : '')
}

export default function HomePage() {
  const navigate = useNavigate()       // serve per cambiare pagina
  const { pets, loading } = usePets()  // carica la lista degli animali dal database
  const { user, signOut } = useAuth()  // legge l'utente loggato e la funzione di logout
  const { t, lang } = useLang()        // t() traduce le parole (IT/EN), lang = lingua attuale

  // "useState" = variabile che, quando cambia, aggiorna automaticamente lo schermo.
  // profiles = lista dei profili attivi (es. ["owner"] o ["vet"])
  const [profiles, setProfiles] = useState<string[]>(() => getProfilesFromUser(user))
  // showConfirmed = true solo dopo la conferma email (mostra un banner verde)
  const [showConfirmed, setShowConfirmed] = useState(false)
  // showSettings = true quando il modal impostazioni è aperto
  const [showSettings, setShowSettings] = useState(false)

  // useEffect = codice che gira una volta sola quando la pagina si apre.
  // Controlla se nell'URL c'è "type=signup" (link di conferma email cliccato).
  useEffect(() => {
    if (window.location.hash.includes('type=signup')) {
      setShowConfirmed(true)
      window.history.replaceState(null, '', window.location.pathname) // pulisce l'URL
    }
  }, [])

  // Estrae il primo nome dell'utente (es. "Mario") per il saluto.
  // Se non c'è il nome, usa la parte dell'email prima della @.
  const userName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? ''

  // Variabili derivate dai profili: isOwner e isVet servono per decidere cosa mostrare
  const hasChosen = profiles.length > 0  // ha già scelto almeno un profilo?
  const isOwner = profiles.includes('owner')
  const isVet = profiles.includes('vet')

  // Quando l'utente clicca su un profilo (owner o vet),
  // aggiorna lo stato locale e salva su Supabase + localStorage
  function chooseProfile(role: string) {
    const updated = [role]
    setProfiles(updated)
    saveProfiles(updated)
  }

  function openSettings() {
    setShowSettings(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* ── Barra in alto ── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <LanguageSwitcher /> {/* bottone IT/EN */}
          <div className="flex items-center gap-2">
            {/* Bottone emergenza: apre Google Maps con "veterinario di guardia vicino a me" */}
            <button
              onClick={() => window.open('https://maps.google.com/?q=veterinario+di+guardia+vicino+a+me', '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: '#FCEBEB', color: '#B42318', border: '1px solid #F3C6C4' }}
            >
              <TriangleAlert size={15} />
              {t('emergency')}
            </button>
            {/* Ingranaggio: apre le impostazioni per cambiare profilo */}
            <button onClick={openSettings} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
              <Settings size={16} />
            </button>
            {/* Uscita: fa il logout e torna alla pagina di login */}
            <button onClick={signOut} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Banner verde di conferma email (appare solo dopo la registrazione) ── */}
      {showConfirmed && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <p className="text-sm text-green-700 font-medium">✅ {t('homeConfirmed')}</p>
            <button onClick={() => setShowConfirmed(false)} className="text-green-500 text-lg leading-none ml-3">×</button>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* ── Titolo di benvenuto ── */}
        <h1 className={`text-[22px] font-medium text-gray-900 ${hasChosen ? 'mb-5' : 'mb-0'}`}>
          {t('homeGreeting')} {userName} 👋
        </h1>

        {/* ── Scelta del profilo (visibile solo se non si è ancora scelto) ── */}
        {!hasChosen && (
          <>
            <p className="text-[15px] text-gray-500 mt-0.5 mb-5">{t('homeSubtitle')}</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Card "I miei animali" */}
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

              {/* Card "Veterinario" */}
              <button
                onClick={() => chooseProfile('vet')}
                className="text-left p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-400 transition-all"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#E6F1FB' }}>
                  <Stethoscope size={20} style={{ color: '#185FA5' }} />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{t('homeVet')}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('settingsVetDesc')}</p>
              </button>
            </div>
          </>
        )}

        {/* ── Lista animali (visibile solo se il profilo è "owner") ── */}
        {isOwner && (
          <div className="card mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HeartPulse size={18} className="text-primary-600" />
                <h2 className="font-semibold text-gray-900">{t('homeMyPets')}</h2>
              </div>
              {/* Bottone "Aggiungi" in alto a destra */}
              <button
                onClick={() => navigate('/new-pet')}
                className="flex items-center gap-1 text-sm text-primary-600 font-medium hover:text-primary-700"
              >
                <Plus size={16} /> {t('add')}
              </button>
            </div>

            {/* Mentre carica dal database mostra lo spinner */}
            {loading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : pets.length === 0 ? (
              // Nessun animale ancora: messaggio vuoto con bottone
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🐾</div>
                <p className="text-gray-600 font-medium">{t('homeNoPets')}</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">{t('homeNoPetsDesc')}</p>
                <button onClick={() => navigate('/new-pet')} className="btn-primary text-sm">{t('homeAddPet')}</button>
              </div>
            ) : (
              // Lista degli animali: ogni riga è cliccabile e porta alla pagina dell'animale
              <div className="space-y-2">
                {pets.map(pet => (
                  <button
                    key={pet.id} // "key" = identificatore unico per React
                    onClick={() => navigate(`/pet/${pet.id}`)} // naviga alla pagina di questo animale
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  >
                    {/* Foto o emoji specie come avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                      {pet.photo_url
                        ? <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                        : <span>{SPECIES_EMOJI[pet.species] ?? '🐾'}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{pet.name}</p>
                      {/* Sottotitolo: specie · razza · età */}
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

        {/* ── Sezione veterinario (visibile solo se il profilo è "vet") ── */}
        {isVet && (
          <div className="card mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope size={18} className="text-blue-500" />
              <h2 className="font-semibold text-gray-900">{t('homeVet')}</h2>
            </div>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🩺</div>
              <p className="text-gray-600 font-medium">{t('vetDashTitle')}</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">{t('settingsVetDesc')}</p>
              {/* Bottone per aprire il gestionale clienti/animali del veterinario */}
              <button onClick={() => navigate('/vet')} className="btn-primary text-sm">{t('vetAddClient')}</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Impostazioni (si apre cliccando l'ingranaggio) ── */}
      {showSettings && (
        // "fixed inset-0" = copre tutto lo schermo. Il div nero semitrasparente è lo sfondo.
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4">
          {/* Cliccando lo sfondo si chiude il modal */}
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

                {/* Card "I miei animali" nelle impostazioni.
                    Cliccandola si passa subito al profilo owner e il modal si chiude. */}
                <button
                  onClick={() => {
                    const updated = ['owner']
                    setProfiles(updated)
                    saveProfiles(updated)
                    setShowSettings(false)
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    isOwner ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E1F5EE' }}>
                    <HeartPulse size={18} style={{ color: '#0F6E56' }} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${isOwner ? 'text-primary-700' : 'text-gray-800'}`}>{t('homeMyPets')}</p>
                    <p className="text-xs text-gray-400">{t('homeOwner')}</p>
                  </div>
                  {/* Segno di spunta: visibile solo se questo profilo è attivo */}
                  {isOwner && <Check size={18} className="text-primary-500 flex-shrink-0" />}
                </button>

                {/* Card "Veterinario" nelle impostazioni.
                    Stessa logica: clic → switch immediato al profilo vet. */}
                <button
                  onClick={() => {
                    const updated = ['vet']
                    setProfiles(updated)
                    saveProfiles(updated)
                    setShowSettings(false)
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    isVet ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E6F1FB' }}>
                    <Stethoscope size={18} style={{ color: '#185FA5' }} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${isVet ? 'text-blue-700' : 'text-gray-800'}`}>{t('homeVet')}</p>
                    <p className="text-xs text-gray-400">{t('settingsVetDesc')}</p>
                  </div>
                  {isVet && <Check size={18} className="text-blue-500 flex-shrink-0" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
