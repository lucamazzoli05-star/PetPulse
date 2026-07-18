import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, Pencil, Plus, Trash2, Bell, FileText, Upload, X, Scale } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useVetWeightEntries, useVetRecords } from '../../hooks/useVetData'
import { useLang } from '../../context/LanguageContext'
import { type VetAnimal, type VetRecord } from '../../types'
import { SPECIES_EMOJI, translateSpecies } from '../../lib/species'
import { type TranslationKey } from '../../lib/translations'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

function petAge(birthDate: string | null, t: (k: TranslationKey) => string): string {
  if (!birthDate) return ''
  const diff = Date.now() - new Date(birthDate).getTime()
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44))
  if (years >= 1) return `${years} ${years === 1 ? t('ageYearSingular') : t('ageYearPlural')}`
  if (months >= 1) return `${months} ${months === 1 ? t('ageMonthSingular') : t('ageMonthPlural')}`
  return t('ageLessThanMonth')
}

function formatDate(d: string, lang: string) {
  return new Date(d).toLocaleDateString(lang === 'EN' ? 'en-GB' : 'it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

const emptyRecord = { date: new Date().toISOString().split('T')[0], reason: '', medicines: '', next_visit_date: '', notes: '', report_url: '' }

export default function VetAnimalPage() {
  const { clientId, animalId } = useParams<{ clientId: string; animalId: string }>()
  const navigate = useNavigate()
  const { entries: weightEntries, loading: weightLoading, add: addWeight, remove: removeWeight } = useVetWeightEntries(animalId!)
  const { records, loading: recordsLoading, add: addRecord, update: updateRecord, remove: removeRecord } = useVetRecords(animalId!)
  const { t, lang } = useLang()
  const [animal, setAnimal] = useState<VetAnimal | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'visits' | 'weight'>('visits')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showEditAnimal, setShowEditAnimal] = useState(false)
  const [animalForm, setAnimalForm] = useState({ allergies: '', chronic_conditions: '', notes: '' })
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [recordForm, setRecordForm] = useState(emptyRecord)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [weightForm, setWeightForm] = useState({ date: new Date().toISOString().split('T')[0], weight_kg: '', notes: '' })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!animalId) return
    supabase.from('vet_animals').select('*').eq('id', animalId).single()
      .then(({ data }) => {
        setAnimal(data)
        if (data) setAnimalForm({ allergies: data.allergies ?? '', chronic_conditions: data.chronic_conditions ?? '', notes: data.notes ?? '' })
        setLoading(false)
      })
  }, [animalId])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !animal) return
    setUploadingPhoto(true)
    const path = `vet-photos/${animalId}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('petpulse-files').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('petpulse-files').getPublicUrl(data.path)
      await supabase.from('vet_animals').update({ photo_url: urlData.publicUrl }).eq('id', animal.id)
      setAnimal({ ...animal, photo_url: urlData.publicUrl })
    }
    setUploadingPhoto(false)
  }

  async function handleSaveAnimal() {
    if (!animal) return
    setSaving(true)
    const { data } = await supabase.from('vet_animals').update({
      allergies: animalForm.allergies || null,
      chronic_conditions: animalForm.chronic_conditions || null,
      notes: animalForm.notes || null,
    }).eq('id', animal.id).select().single()
    if (data) setAnimal(data)
    setShowEditAnimal(false)
    setSaving(false)
  }

  async function handleUploadReport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `vet-reports/${animalId}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('petpulse-files').upload(path, file)
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('petpulse-files').getPublicUrl(data.path)
      setRecordForm(f => ({ ...f, report_url: urlData.publicUrl }))
    }
    setUploading(false)
  }

  function openNewRecord() { setEditingRecordId(null); setRecordForm(emptyRecord); setShowRecordModal(true) }
  function openEditRecord(r: VetRecord) {
    setEditingRecordId(r.id)
    setRecordForm({ date: r.date, reason: r.reason, medicines: r.medicines ?? '', next_visit_date: r.next_visit_date ?? '', notes: r.notes ?? '', report_url: r.report_url ?? '' })
    setShowRecordModal(true)
  }

  async function handleSaveRecord() {
    setSaving(true)
    const payload = {
      animal_id: animalId!,
      date: recordForm.date,
      reason: recordForm.reason,
      medicines: recordForm.medicines || null,
      next_visit_date: recordForm.next_visit_date || null,
      report_url: recordForm.report_url || null,
      notes: recordForm.notes || null,
    }
    if (editingRecordId) await updateRecord(editingRecordId, payload)
    else await addRecord(payload)
    setShowRecordModal(false)
    setRecordForm(emptyRecord)
    setSaving(false)
  }

  async function handleAddWeight() {
    setSaving(true)
    await addWeight({ animal_id: animalId!, date: weightForm.date, weight_kg: parseFloat(weightForm.weight_kg), notes: weightForm.notes || null })
    setShowWeightModal(false)
    setWeightForm({ date: new Date().toISOString().split('T')[0], weight_kg: '', notes: '' })
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  if (!animal) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Animale non trovato</p></div>

  const chartData = weightEntries.map(e => ({
    date: new Date(e.date).toLocaleDateString(lang === 'EN' ? 'en-GB' : 'it-IT', { day: '2-digit', month: 'short' }),
    peso: Number(e.weight_kg)
  }))

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(`/vet/client/${clientId}`)} className="p-1 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={22} />
          </button>

          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl overflow-hidden cursor-pointer" onClick={() => photoInputRef.current?.click()}>
              {uploadingPhoto ? <Spinner size="sm" /> : animal.photo_url ? <img src={animal.photo_url} alt={animal.name} className="w-full h-full object-cover" /> : <span>{SPECIES_EMOJI[animal.species] ?? '🐾'}</span>}
            </div>
            <button onClick={() => photoInputRef.current?.click()} className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
              <Camera size={10} className="text-white" />
            </button>
            <input ref={photoInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-lg truncate">{animal.name}</h1>
            <p className="text-xs text-gray-500">{translateSpecies(animal.species, lang)}{animal.breed ? ` · ${animal.breed}` : ''}{animal.birth_date ? ` · ${petAge(animal.birth_date, t)}` : ''}</p>
          </div>
          <button onClick={() => setShowEditAnimal(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-500">
            <Pencil size={17} />
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-lg mx-auto px-4 flex gap-1 pb-px">
          {[{ id: 'visits', label: '🩺 ' + t('vetVisits') }, { id: 'weight', label: '⚖️ ' + t('weightChartTitle') }].map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id as any)}
              className={`px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${tab === tb.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Allergie/patologie */}
        {(animal.allergies || animal.chronic_conditions) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 space-y-1">
            {animal.allergies && <p className="text-xs text-amber-800"><span className="font-semibold">⚠️ Allergie:</span> {animal.allergies}</p>}
            {animal.chronic_conditions && <p className="text-xs text-amber-800"><span className="font-semibold">🏥 Patologie:</span> {animal.chronic_conditions}</p>}
          </div>
        )}

        {/* Tab Visite */}
        {tab === 'visits' && (
          <div>
            <div className="flex justify-end mb-3">
              <button onClick={openNewRecord} className="btn-primary text-sm flex items-center gap-1">
                <Plus size={15} /> {t('add')}
              </button>
            </div>
            {recordsLoading ? <div className="flex justify-center py-8"><Spinner /></div> : records.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <div className="text-4xl mb-2">🩺</div>
                <p className="text-gray-500 text-sm">{t('vetNoRecords')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map(r => {
                  const nextDays = r.next_visit_date ? daysUntil(r.next_visit_date) : null
                  const nextSoon = nextDays !== null && nextDays <= 7 && nextDays >= 0
                  return (
                    <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{r.reason}</p>
                          <p className="text-xs text-primary-600 font-medium">{formatDate(r.date, lang)}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openEditRecord(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-500"><Pencil size={14} /></button>
                          <button onClick={() => removeRecord(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      {r.medicines && <div className="bg-blue-50 rounded-lg px-3 py-2 mb-2"><p className="text-xs text-blue-700 font-medium">💊 {t('visitsMedicines')}</p><p className="text-xs text-blue-600 mt-0.5">{r.medicines}</p></div>}
                      {r.notes && <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2"><p className="text-xs text-gray-500 whitespace-pre-wrap">{r.notes}</p></div>}
                      {r.next_visit_date && (
                        <p className={`flex items-center gap-1 text-xs font-medium mt-1 ${nextSoon ? 'text-amber-600' : 'text-gray-500'}`}>
                          <Bell size={11} /> {t('visitsNextVisit')}: {formatDate(r.next_visit_date, lang)}
                        </p>
                      )}
                      {r.report_url && <a href={r.report_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-600 font-medium mt-1 hover:underline"><FileText size={12} /> {t('visitsViewReport')}</a>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab Peso */}
        {tab === 'weight' && (
          <div>
            <div className="flex justify-end mb-3">
              <button onClick={() => setShowWeightModal(true)} className="btn-primary text-sm flex items-center gap-1">
                <Plus size={15} /> {t('add')}
              </button>
            </div>
            {weightLoading ? <div className="flex justify-center py-8"><Spinner /></div> : weightEntries.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <div className="text-4xl mb-2">⚖️</div>
                <p className="text-gray-500 text-sm">{t('weightEmpty')}</p>
              </div>
            ) : (
              <>
                {weightEntries.length >= 2 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-2 font-medium">{t('weightChartTitle')}</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                        <Tooltip formatter={(v) => [`${v} kg`, t('weightChartLabel')]} />
                        <Line type="monotone" dataKey="peso" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="space-y-2">
                  {[...weightEntries].reverse().map(e => (
                    <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Scale size={16} className="text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{Number(e.weight_kg).toFixed(2)} kg</p>
                        <p className="text-xs text-gray-500">{formatDate(e.date, lang)}</p>
                      </div>
                      <button onClick={() => removeWeight(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal visita */}
      {showRecordModal && (
        <Modal title={editingRecordId ? t('visitsEditTitle') : t('vetNewRecord')} onClose={() => { setShowRecordModal(false); setRecordForm(emptyRecord) }}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('visitsDate')} *</label>
              <input className="input" type="date" value={recordForm.date} onChange={e => setRecordForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('visitsReason')} *</label>
              <input className="input" placeholder={t('visitsReasonPlaceholder')} value={recordForm.reason} onChange={e => setRecordForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">💊 {t('visitsMedicines')}</label>
              <textarea className="input resize-none" rows={2} placeholder={t('visitsMedicinesPlaceholder')} value={recordForm.medicines} onChange={e => setRecordForm(f => ({ ...f, medicines: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📋 {t('visitsNotes')}</label>
              <textarea className="input resize-none" rows={3} placeholder={t('visitsNotesPlaceholder')} value={recordForm.notes} onChange={e => setRecordForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📎 {t('visitsReport')}</label>
              {recordForm.report_url ? (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <FileText size={14} className="text-green-600" />
                  <span className="text-xs text-green-700 flex-1 truncate">{t('visitsReportUploaded')}</span>
                  <button onClick={() => setRecordForm(f => ({ ...f, report_url: '' }))}><X size={14} className="text-gray-400 hover:text-red-500" /></button>
                </div>
              ) : (
                <label className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
                  <Upload size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{uploading ? t('visitsUploading') : t('visitsUploadReport')}</span>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUploadReport} disabled={uploading} />
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><Bell size={13} className="inline mr-1 text-amber-500" />{t('visitsNextVisitLabel')}</label>
              <input className="input" type="date" value={recordForm.next_visit_date} min={new Date().toISOString().split('T')[0]} onChange={e => setRecordForm(f => ({ ...f, next_visit_date: e.target.value }))} />
            </div>
            <button onClick={handleSaveRecord} disabled={!recordForm.date || !recordForm.reason || saving || uploading} className="btn-primary w-full disabled:opacity-40">
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal peso */}
      {showWeightModal && (
        <Modal title={t('weightModalTitle')} onClose={() => setShowWeightModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')} *</label>
              <input className="input" type="date" value={weightForm.date} onChange={e => setWeightForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('weightKg')} *</label>
              <input className="input" type="number" min="0" step="0.01" placeholder={t('weightKgPlaceholder')} value={weightForm.weight_kg} onChange={e => setWeightForm(f => ({ ...f, weight_kg: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
              <input className="input" value={weightForm.notes} onChange={e => setWeightForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button onClick={handleAddWeight} disabled={!weightForm.date || !weightForm.weight_kg || saving} className="btn-primary w-full disabled:opacity-40">
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal modifica info animale */}
      {showEditAnimal && (
        <Modal title={t('vetEditAnimal')} onClose={() => setShowEditAnimal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">⚠️ {t('vetAllergies')}</label>
              <textarea className="input resize-none" rows={2} placeholder={t('vetAllergiesPlaceholder')} value={animalForm.allergies} onChange={e => setAnimalForm(f => ({ ...f, allergies: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🏥 {t('vetChronic')}</label>
              <textarea className="input resize-none" rows={2} placeholder={t('vetChronicPlaceholder')} value={animalForm.chronic_conditions} onChange={e => setAnimalForm(f => ({ ...f, chronic_conditions: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📋 {t('vetNotes')}</label>
              <textarea className="input resize-none" rows={3} value={animalForm.notes} onChange={e => setAnimalForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button onClick={handleSaveAnimal} disabled={saving} className="btn-primary w-full disabled:opacity-40">
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
