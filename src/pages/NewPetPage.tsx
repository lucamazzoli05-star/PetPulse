import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search, Check } from 'lucide-react'
import { SPECIES_LIST, BREEDS_BY_SPECIES } from '../lib/species'
import { usePets } from '../hooks/usePets'
import { useLang } from '../context/LanguageContext'
import { type PetSection } from '../types'

type Step = 'name' | 'species' | 'breed' | 'birth' | 'sections'

export default function NewPetPage() {
  const navigate = useNavigate()
  const { addPet } = usePets()
  const { t } = useLang()

  const SECTIONS: { id: PetSection; label: string; emoji: string; desc: string }[] = [
    { id: 'vaccines', label: t('sectionVaccinesLabel'), emoji: '💉', desc: t('sectionVaccinesDesc') },
    { id: 'expenses', label: t('sectionExpensesLabel'), emoji: '💰', desc: t('sectionExpensesDesc') },
    { id: 'weight', label: t('sectionWeightLabel'), emoji: '⚖️', desc: t('sectionWeightDesc') },
    { id: 'diary', label: t('sectionDiaryLabel'), emoji: '📔', desc: t('sectionDiaryDesc') },
  ]

  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [speciesSearch, setSpeciesSearch] = useState('')
  const [breed, setBreed] = useState('')
  const [breedSearch, setBreedSearch] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sections, setSections] = useState<PetSection[]>(['vaccines'])
  const [saving, setSaving] = useState(false)

  const steps: Step[] = ['name', 'species', 'breed', 'birth', 'sections']
  const stepIdx = steps.indexOf(step)

  const filteredSpecies = SPECIES_LIST.filter(s => s.toLowerCase().includes(speciesSearch.toLowerCase()))
  const breedList = BREEDS_BY_SPECIES[species] ?? []
  const filteredBreeds = breedList.filter(b => b.toLowerCase().includes(breedSearch.toLowerCase()))

  function toggleSection(id: PetSection) {
    setSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  async function handleFinish() {
    setSaving(true)
    await addPet({
      name,
      species,
      breed: breed || null,
      birth_date: birthDate || null,
      photo_url: null,
      active_sections: sections,
    })
    navigate('/')
  }

  function back() {
    if (stepIdx === 0) navigate('/')
    else setStep(steps[stepIdx - 1])
  }

  function next() {
    setStep(steps[stepIdx + 1])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={back} className="p-1 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium">{t('newPetStep')} {stepIdx + 1} {t('newPetOf')} {steps.length}</p>
            <h1 className="font-semibold text-gray-900">{t('newPetTitle')}</h1>
          </div>
        </div>
        <div className="max-w-lg mx-auto mt-3">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-8">

        {/* Step: Name */}
        {step === 'name' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t('newPetNameQ')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('newPetNameDesc')}</p>
            <input
              className="input text-lg"
              placeholder={t('newPetNamePlaceholder')}
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
            <button
              onClick={next}
              disabled={!name.trim()}
              className="btn-primary w-full mt-6 py-3 disabled:opacity-40"
            >
              {t('continue')}
            </button>
          </div>
        )}

        {/* Step: Species */}
        {step === 'species' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t('newPetSpeciesQ')}</h2>
            <p className="text-gray-500 text-sm mb-4">{t('newPetSpeciesDesc')}</p>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                className="input pl-9"
                placeholder={t('newPetSpeciesSearch')}
                value={speciesSearch}
                onChange={e => setSpeciesSearch(e.target.value)}
              />
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredSpecies.map(s => (
                <button
                  key={s}
                  onClick={() => { setSpecies(s); setBreed(''); setBreedSearch(''); next() }}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    species === s ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
              {speciesSearch && !filteredSpecies.includes(speciesSearch) && (
                <button
                  onClick={() => { setSpecies(speciesSearch); setBreed(''); next() }}
                  className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100"
                >
                  {t('newPetSpeciesAdd')} "{speciesSearch}"
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step: Breed */}
        {step === 'breed' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t('newPetBreedQ')}</h2>
            <p className="text-gray-500 text-sm mb-4">{t('newPetBreedDesc')}</p>
            {breedList.length > 0 && (
              <>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    className="input pl-9"
                    placeholder={t('newPetBreedSearch')}
                    value={breedSearch}
                    onChange={e => setBreedSearch(e.target.value)}
                  />
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto mb-3">
                  {filteredBreeds.map(b => (
                    <button
                      key={b}
                      onClick={() => { setBreed(b); next() }}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                        breed === b ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                  {breedSearch && !filteredBreeds.includes(breedSearch) && (
                    <button
                      onClick={() => { setBreed(breedSearch); next() }}
                      className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100"
                    >
                      {t('newPetBreedAdd')} "{breedSearch}"
                    </button>
                  )}
                </div>
              </>
            )}
            {breedList.length === 0 && (
              <input
                className="input mb-3"
                placeholder={t('newPetBreedWrite')}
                value={breedSearch}
                onChange={e => setBreedSearch(e.target.value)}
                onBlur={() => setBreed(breedSearch)}
              />
            )}
            <button onClick={next} className="btn-secondary w-full py-3">
              {t('newPetBreedSkip')}
            </button>
          </div>
        )}

        {/* Step: Birth date */}
        {step === 'birth' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t('newPetBirthQ')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('newPetBirthDesc')}</p>
            <input
              className="input"
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <button onClick={next} className="btn-primary w-full mt-4 py-3">
              {t('continue')}
            </button>
            <button onClick={next} className="btn-secondary w-full mt-2 py-3">
              {t('skip')}
            </button>
          </div>
        )}

        {/* Step: Sections */}
        {step === 'sections' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t('newPetSectionsQ')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('newPetSectionsDesc')} {name}</p>
            <div className="space-y-2">
              {SECTIONS.map(s => {
                const active = sections.includes(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSection(s.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      active ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-medium ${active ? 'text-primary-700' : 'text-gray-800'}`}>{s.label}</p>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      active ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                    }`}>
                      {active && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
            <button
              onClick={handleFinish}
              disabled={sections.length === 0 || saving}
              className="btn-primary w-full mt-6 py-3 disabled:opacity-40"
            >
              {saving ? t('saving') : `${t('newPetCreate')} ${name}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
