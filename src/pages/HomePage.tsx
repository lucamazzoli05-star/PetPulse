import { useNavigate } from 'react-router-dom'
import { PawPrint, Plus, MapPin, LogOut, ChevronRight, Briefcase } from 'lucide-react'
import { usePets } from '../hooks/usePets'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

function petAge(birthDate: string | null): string {
  if (!birthDate) return ''
  const diff = Date.now() - new Date(birthDate).getTime()
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44))
  if (years >= 1) return `${years} ann${years === 1 ? 'o' : 'i'}`
  if (months >= 1) return `${months} mes${months === 1 ? 'e' : 'i'}`
  return '< 1 mese'
}

export default function HomePage() {
  const navigate = useNavigate()
  const { pets, loading } = usePets()
  const { user, signOut } = useAuth()

  function openEmergency() {
    window.open('https://maps.google.com/?q=veterinario+di+guardia+vicino+a+me', '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 rounded-xl p-1.5">
              <PawPrint size={20} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">PetPulse</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">{user?.email}</span>
            <button onClick={signOut} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        {/* I miei animali */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PawPrint size={18} className="text-primary-600" />
              <h2 className="font-semibold text-gray-900">I miei animali</h2>
            </div>
            <button
              onClick={() => navigate('/new-pet')}
              className="flex items-center gap-1 text-sm text-primary-600 font-medium hover:text-primary-700"
            >
              <Plus size={16} /> Aggiungi
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🐾</div>
              <p className="text-gray-600 font-medium">Nessun animale ancora</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Aggiungi il tuo primo animale per iniziare</p>
              <button onClick={() => navigate('/new-pet')} className="btn-primary text-sm">
                Aggiungi animale
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
                      : <span>{pet.species === 'Gatto' ? '🐱' : pet.species === 'Cane' ? '🐶' : '🐾'}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{pet.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}{pet.birth_date ? ` · ${petAge(pet.birth_date)}` : ''}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gestione clienti (placeholder fase 2) */}
        <div className="card opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={18} className="text-gray-400" />
            <h2 className="font-semibold text-gray-400">Gestione clienti</h2>
            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full ml-auto">Prossimamente</span>
          </div>
          <p className="text-sm text-gray-400">Area riservata ai professionisti del settore veterinario.</p>
        </div>
      </div>

      {/* Emergency button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent">
        <div className="max-w-lg mx-auto">
          <button
            onClick={openEmergency}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold py-3.5 rounded-2xl shadow-lg transition-all"
          >
            <MapPin size={20} />
            Emergenza — Trova veterinario vicino
          </button>
        </div>
      </div>
    </div>
  )
}
