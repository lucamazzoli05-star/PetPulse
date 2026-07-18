import { useState } from 'react'
import { Plus, Trash2, Stethoscope, Bell, FileText, Upload, X, Pencil } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useVetVisits } from '../../hooks/usePetData'
import { useLang } from '../../context/LanguageContext'
import { type VetVisit } from '../../types'
import Modal from '../ui/Modal'
import EmptyState from '../ui/EmptyState'

function formatDate(d: string, lang: string) {
  return new Date(d).toLocaleDateString(lang === 'EN' ? 'en-GB' : 'it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  reason: '',
  vet_name: '',
  medicines: '',
  next_visit_date: '',
  notes: '',
  report_url: '',
}

type FormState = typeof emptyForm

function visitToForm(v: VetVisit): FormState {
  return {
    date: v.date,
    reason: v.reason,
    vet_name: v.vet_name ?? '',
    medicines: v.medicines ?? '',
    next_visit_date: v.next_visit_date ?? '',
    notes: v.notes ?? '',
    report_url: v.report_url ?? '',
  }
}

export default function VetVisitsSection({ petId }: { petId: string }) {
  const { visits, loading, add, update, remove } = useVetVisits(petId)
  const { t, lang } = useLang()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(v: VetVisit) {
    setEditingId(v.id)
    setForm(visitToForm(v))
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `reports/${petId}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('petpulse-files').upload(path, file)
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('petpulse-files').getPublicUrl(data.path)
      setForm(f => ({ ...f, report_url: urlData.publicUrl }))
    }
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      date: form.date,
      reason: form.reason,
      vet_name: form.vet_name || null,
      medicines: form.medicines || null,
      next_visit_date: form.next_visit_date || null,
      report_url: form.report_url || null,
      notes: form.notes || null,
    }
    if (editingId) {
      await update(editingId, payload)
    } else {
      await add(payload)
    }
    closeModal()
    setSaving(false)
  }

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">{t('loading')}</div>

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1">
          <Plus size={15} /> {t('add')}
        </button>
      </div>

      {visits.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title={t('visitsEmpty')}
          description={t('visitsEmptyDesc')}
          action={{ label: t('visitsAddBtn'), onClick: openNew }}
        />
      ) : (
        <div className="space-y-3">
          {visits.map(v => {
            const nextDays = v.next_visit_date ? daysUntil(v.next_visit_date) : null
            const nextSoon = nextDays !== null && nextDays <= 7 && nextDays >= 0
            return (
              <div key={v.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{v.reason}</p>
                    <p className="text-xs text-primary-600 font-medium mt-0.5">{formatDate(v.date, lang)}</p>
                    {v.vet_name && <p className="text-xs text-gray-500 mt-0.5">🩺 {v.vet_name}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-500">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {v.medicines && (
                  <div className="bg-blue-50 rounded-lg px-3 py-2 mb-2">
                    <p className="text-xs text-blue-700 font-medium">💊 {t('visitsMedicines')}</p>
                    <p className="text-xs text-blue-600 mt-0.5 whitespace-pre-wrap">{v.medicines}</p>
                  </div>
                )}

                {v.notes && (
                  <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2">
                    <p className="text-xs text-gray-500 whitespace-pre-wrap">{v.notes}</p>
                  </div>
                )}

                {v.next_visit_date && (
                  <div className={`flex items-center gap-1.5 text-xs font-medium mt-2 ${nextSoon ? 'text-amber-600' : 'text-gray-500'}`}>
                    <Bell size={11} />
                    {t('visitsNextVisit')}: {formatDate(v.next_visit_date, lang)}
                    {nextSoon && ` (${nextDays === 0 ? t('visitsToday') : `${nextDays} ${t('visitsDaysLeft')}`})`}
                  </div>
                )}

                {v.report_url && (
                  <a href={v.report_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary-600 font-medium mt-2 hover:underline">
                    <FileText size={12} /> {t('visitsViewReport')}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? t('visitsEditTitle') : t('visitsModalTitle')} onClose={closeModal}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('visitsDate')} *</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('visitsReason')} *</label>
              <input className="input" placeholder={t('visitsReasonPlaceholder')} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('visitsVetName')}</label>
              <input className="input" placeholder={t('visitsVetNamePlaceholder')} value={form.vet_name} onChange={e => setForm(f => ({ ...f, vet_name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">💊 {t('visitsMedicines')}</label>
              <textarea className="input resize-none" rows={2} placeholder={t('visitsMedicinesPlaceholder')} value={form.medicines} onChange={e => setForm(f => ({ ...f, medicines: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📋 {t('visitsNotes')}</label>
              <textarea className="input resize-none" rows={3} placeholder={t('visitsNotesPlaceholder')} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📎 {t('visitsReport')}</label>
              {form.report_url ? (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <FileText size={14} className="text-green-600" />
                  <span className="text-xs text-green-700 flex-1 truncate">{t('visitsReportUploaded')}</span>
                  <button onClick={() => setForm(f => ({ ...f, report_url: '' }))} className="text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
                  <Upload size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{uploading ? t('visitsUploading') : t('visitsUploadReport')}</span>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload} disabled={uploading} />
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Bell size={13} className="inline mr-1 text-amber-500" />
                {t('visitsNextVisitLabel')}
              </label>
              <input className="input" type="date" value={form.next_visit_date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(f => ({ ...f, next_visit_date: e.target.value }))} />
            </div>
            <button
              onClick={handleSave}
              disabled={!form.date || !form.reason || saving || uploading}
              className="btn-primary w-full disabled:opacity-40"
            >
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
