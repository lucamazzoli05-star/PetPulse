import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { type Pet, type PetSection } from '../types'
import { usePets } from '../hooks/usePets'
import { useLang } from '../context/LanguageContext'
import { type TranslationKey } from '../lib/translations'
import VaccinesSection from '../components/sections/VaccinesSection'
import ExpensesSection from '../components/sections/ExpensesSection'
import WeightSection from '../components/sections/WeightSection'
import DiarySection from '../components/sections/DiarySection'
import Spinner from '../components/ui/Spinner'

function petAge(birthDate: string | null, t: (k: TranslationKey) => string): string {
  if (!birthDate) return ''
  const diff = Date.now() - new Date(birthDate).getTime()
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44))
  if (years >= 1) return `${years} ${years === 1 ? t('ageYearSingular') : t('ageYearPlural')}`
  if (months >= 1) return `${months} ${months === 1 ? t('ageMonthSingular') : t('ageMonthPlural')}`
  return t('ageLessThanMonth')
}

export default function PetPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { deletePet } = usePets()
  const { t } = useLang()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<PetSection | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const SECTIONS_META: { id: PetSection; label: string; emoji: string }[] = [
    { id: 'vaccines', label: t('sectionVaccinesLabel'), emoji: '💉' },
    { id: 'expenses', label: t('sectionExpensesLabel'), emoji: '💰' },
    { id: 'weight', label: t('sectionWeightLabel'), emoji: '⚖️' },
    { id: 'diary', label: t('sectionDiaryLabel'), emoji: '📔' },
  ]

  useEffect(() => {
    if (!id) return
    supabase.from('pets').select('*').eq('id', id).single()
      .then(({ data }) => {
        setPet(data)
        if (data?.active_sections?.length > 0) setActiveTab(data.active_sections[0])
        setLoading(false)
      })
  }, [id])

  async function activateSection(section: PetSection) {
    if (!pet) return
    const updated = [...pet.active_sections, section]
    await supabase.from('pets').update({ active_sections: updated }).eq('id', pet.id)
    setPet({ ...pet, active_sections: updated })
    setActiveTab(section)
  }

  async function handleDelete() {
    if (!pet) return
    await deletePet(pet.id)
    navigate('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  if (!pet) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">{t('petNotFound')}</p>
    </div>
  )

  const inactiveSections = SECTIONS_META.filter(s => !pet.active_sections.includes(s.id))
  const activeSections = SECTIONS_META.filter(s => pet.active_sections.includes(s.id))

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-lg truncate">{pet.name}</h1>
            <p className="text-xs text-gray-500 truncate">
              {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}{pet.birth_date ? ` · ${petAge(pet.birth_date, t)}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => window.open('https://maps.google.com/?q=veterinario+di+guardia+vicino+a+me', '_blank')}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500"
            >
              <MapPin size={18} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {activeSections.length > 0 && (
          <div className="max-w-lg mx-auto px-4 flex gap-1 overflow-x-auto pb-px">
            {activeSections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  activeTab === s.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {activeTab === 'vaccines' && <VaccinesSection petId={pet.id} />}
        {activeTab === 'expenses' && <ExpensesSection petId={pet.id} species={pet.species} />}
        {activeTab === 'weight' && <WeightSection petId={pet.id} />}
        {activeTab === 'diary' && <DiarySection petId={pet.id} />}

        {activeSections.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium text-gray-700">{t('petNoSections')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('petNoSectionsDesc')}</p>
          </div>
        )}

        {inactiveSections.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
              <Plus size={12} className="inline mr-1" />
              {t('petActivateSections')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {inactiveSections.map(s => (
                <button
                  key={s.id}
                  onClick={() => activateSection(s.id)}
                  className="flex items-center gap-2 p-3 bg-white border border-dashed border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all text-left"
                >
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-sm text-gray-600 font-medium leading-tight">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-bold text-gray-900 mb-2">{t('petDeleteTitle')} {pet.name}?</h2>
            <p className="text-sm text-gray-500 mb-5">{t('petDeleteDesc')}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">{t('cancel')}</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl font-medium transition-colors">
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
