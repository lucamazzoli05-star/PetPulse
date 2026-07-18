import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, ChevronRight, Pencil, Trash2, Phone, Mail, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useVetAnimals } from '../../hooks/useVetData'
import { useLang } from '../../context/LanguageContext'
import { type VetClient, type VetAnimal } from '../../types'
import { SPECIES_EMOJI, SPECIES_LIST, BREEDS_BY_SPECIES, translateSpecies } from '../../lib/species'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

const emptyAnimalForm = { name: '', species: '', breed: '', birth_date: '', notes: '' }

function clientToForm(c: VetClient) {
  return {
    name: c.name, surname: c.surname, phone: c.phone ?? '',
    email: c.email ?? '', address: c.address ?? '',
    codice_fiscale: c.codice_fiscale ?? '', notes: c.notes ?? '',
  }
}

export default function VetClientPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { animals, loading, add, remove } = useVetAnimals(clientId!)
  const { t, lang } = useLang()
  const [client, setClient] = useState<VetClient | null>(null)
  const [clientLoading, setClientLoading] = useState(true)
  const [showAnimalModal, setShowAnimalModal] = useState(false)
  const [showEditClient, setShowEditClient] = useState(false)
  const [animalForm, setAnimalForm] = useState(emptyAnimalForm)
  const [clientForm, setClientForm] = useState(clientToForm({} as VetClient))
  const [saving, setSaving] = useState(false)
  const [showDeleteAnimalId, setShowDeleteAnimalId] = useState<string | null>(null)

  useEffect(() => {
    if (!clientId) return
    supabase.from('vet_clients').select('*').eq('id', clientId).single()
      .then(({ data }) => { setClient(data); if (data) setClientForm(clientToForm(data)); setClientLoading(false) })
  }, [clientId])

  async function handleSaveClient() {
    if (!client) return
    setSaving(true)
    const { data } = await supabase.from('vet_clients').update({
      name: clientForm.name, surname: clientForm.surname,
      phone: clientForm.phone || null, email: clientForm.email || null,
      address: clientForm.address || null, codice_fiscale: clientForm.codice_fiscale || null,
      notes: clientForm.notes || null,
    }).eq('id', client.id).select().single()
    if (data) setClient(data)
    setShowEditClient(false)
    setSaving(false)
  }

  async function handleAddAnimal() {
    setSaving(true)
    await add({
      client_id: clientId!,
      name: animalForm.name,
      species: animalForm.species,
      breed: animalForm.breed || null,
      birth_date: animalForm.birth_date || null,
      photo_url: null,
      allergies: null,
      chronic_conditions: null,
      notes: animalForm.notes || null,
    })
    setShowAnimalModal(false)
    setAnimalForm(emptyAnimalForm)
    setSaving(false)
  }

  if (clientLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  if (!client) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cliente non trovato</p></div>

  const breedList = BREEDS_BY_SPECIES[animalForm.species] ?? []

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/vet')} className="p-1 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-lg truncate">{client.surname} {client.name}</h1>
            <p className="text-xs text-gray-500">{t('vetClient')}</p>
          </div>
          <button onClick={() => setShowEditClient(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-500">
            <Pencil size={17} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Info cliente */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
          {client.phone && (
            <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-sm text-gray-700">
              <Phone size={14} className="text-primary-500" /> {client.phone}
            </a>
          )}
          {client.email && (
            <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-gray-700">
              <Mail size={14} className="text-primary-500" /> {client.email}
            </a>
          )}
          {client.address && (
            <p className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin size={14} className="text-primary-500" /> {client.address}
            </p>
          )}
          {client.codice_fiscale && (
            <p className="text-sm text-gray-500">CF: <span className="font-mono">{client.codice_fiscale}</span></p>
          )}
          {client.notes && (
            <div className="bg-gray-50 rounded-lg p-3 mt-2">
              <p className="text-xs text-gray-500 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Animali */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">{t('vetAnimals')}</h2>
            <button onClick={() => setShowAnimalModal(true)} className="btn-primary text-sm flex items-center gap-1">
              <Plus size={15} /> {t('vetAddAnimal')}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : animals.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
              <div className="text-4xl mb-2">🐾</div>
              <p className="text-gray-500 text-sm">{t('vetNoAnimals')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {animals.map((a: VetAnimal) => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                    {a.photo_url ? <img src={a.photo_url} alt={a.name} className="w-full h-full object-cover" /> : <span>{SPECIES_EMOJI[a.species] ?? '🐾'}</span>}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/vet/client/${clientId}/animal/${a.id}`)}>
                    <p className="font-medium text-gray-900">{a.name}</p>
                    <p className="text-xs text-gray-500">{translateSpecies(a.species, lang)}{a.breed ? ` · ${a.breed}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setShowDeleteAnimalId(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                    <button onClick={() => navigate(`/vet/client/${clientId}/animal/${a.id}`)} className="p-1 text-gray-300">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal nuovo animale */}
      {showAnimalModal && (
        <Modal title={t('vetNewAnimal')} onClose={() => { setShowAnimalModal(false); setAnimalForm(emptyAnimalForm) }}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPetNameQ')} *</label>
              <input className="input" placeholder={t('newPetNamePlaceholder')} value={animalForm.name} onChange={e => setAnimalForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPetSpeciesQ')} *</label>
              <select className="input" value={animalForm.species} onChange={e => setAnimalForm(f => ({ ...f, species: e.target.value, breed: '' }))}>
                <option value="">{t('newPetSpeciesSearch')}</option>
                {SPECIES_LIST.map(s => <option key={s} value={s}>{translateSpecies(s, lang)}</option>)}
              </select>
            </div>
            {animalForm.species && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPetBreedQ')}</label>
                {breedList.length > 0 ? (
                  <select className="input" value={animalForm.breed} onChange={e => setAnimalForm(f => ({ ...f, breed: e.target.value }))}>
                    <option value="">{t('newPetBreedSkip')}</option>
                    {breedList.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                ) : (
                  <input className="input" placeholder={t('newPetBreedWrite')} value={animalForm.breed} onChange={e => setAnimalForm(f => ({ ...f, breed: e.target.value }))} />
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPetBirthQ')}</label>
              <input className="input" type="date" value={animalForm.birth_date} max={new Date().toISOString().split('T')[0]} onChange={e => setAnimalForm(f => ({ ...f, birth_date: e.target.value }))} />
            </div>
            <button onClick={handleAddAnimal} disabled={!animalForm.name || !animalForm.species || saving} className="btn-primary w-full disabled:opacity-40">
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal modifica cliente */}
      {showEditClient && (
        <Modal title={t('vetEditClient')} onClose={() => setShowEditClient(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('vetName')} *</label>
                <input className="input" value={clientForm.name} onChange={e => setClientForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('vetSurname')} *</label>
                <input className="input" value={clientForm.surname} onChange={e => setClientForm(f => ({ ...f, surname: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vetPhone')}</label>
              <input className="input" type="tel" value={clientForm.phone} onChange={e => setClientForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vetEmail')}</label>
              <input className="input" type="email" value={clientForm.email} onChange={e => setClientForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vetAddress')}</label>
              <input className="input" value={clientForm.address} onChange={e => setClientForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vetCF')}</label>
              <input className="input" value={clientForm.codice_fiscale} onChange={e => setClientForm(f => ({ ...f, codice_fiscale: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📋 {t('vetNotes')}</label>
              <textarea className="input resize-none" rows={3} value={clientForm.notes} onChange={e => setClientForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button onClick={handleSaveClient} disabled={!clientForm.name || !clientForm.surname || saving} className="btn-primary w-full disabled:opacity-40">
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </Modal>
      )}

      {showDeleteAnimalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteAnimalId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-bold text-gray-900 mb-2">{t('vetDeleteAnimalTitle')}</h2>
            <p className="text-sm text-gray-500 mb-5">{t('vetDeleteAnimalDesc')}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteAnimalId(null)} className="btn-secondary flex-1">{t('cancel')}</button>
              <button onClick={async () => { await remove(showDeleteAnimalId); setShowDeleteAnimalId(null) }} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl font-medium">
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
