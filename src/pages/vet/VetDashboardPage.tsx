import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, ChevronRight, Pencil, Trash2, Phone, Mail } from 'lucide-react'
import { useVetClients } from '../../hooks/useVetData'
import { useLang } from '../../context/LanguageContext'
import { type VetClient } from '../../types'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

const emptyForm = { name: '', surname: '', phone: '', email: '', address: '', codice_fiscale: '', notes: '' }
type FormState = typeof emptyForm

function clientToForm(c: VetClient): FormState {
  return {
    name: c.name, surname: c.surname, phone: c.phone ?? '',
    email: c.email ?? '', address: c.address ?? '',
    codice_fiscale: c.codice_fiscale ?? '', notes: c.notes ?? '',
  }
}

export default function VetDashboardPage() {
  const navigate = useNavigate()
  const { clients, loading, add, update, remove } = useVetClients()
  const { t } = useLang()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null)

  function openNew() { setEditingId(null); setForm(emptyForm); setShowModal(true) }
  function openEdit(c: VetClient) { setEditingId(c.id); setForm(clientToForm(c)); setShowModal(true) }
  function closeModal() { setShowModal(false); setEditingId(null); setForm(emptyForm) }

  async function handleSave() {
    setSaving(true)
    const payload = {
      name: form.name, surname: form.surname,
      phone: form.phone || null, email: form.email || null,
      address: form.address || null, codice_fiscale: form.codice_fiscale || null,
      notes: form.notes || null,
    }
    if (editingId) await update(editingId, payload)
    else await add(payload)
    closeModal()
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900 text-lg">{t('vetDashTitle')}</h1>
            <p className="text-xs text-gray-500">{clients.length} {t('vetClients')}</p>
          </div>
          <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1">
            <Plus size={15} /> {t('vetAddClient')}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : clients.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">👥</div>
            <p className="font-semibold text-gray-700">{t('vetNoClients')}</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">{t('vetNoClientsDesc')}</p>
            <button onClick={openNew} className="btn-primary">{t('vetAddClient')}</button>
          </div>
        ) : (
          <div className="space-y-2">
            {clients.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/vet/client/${c.id}`)}
                >
                  {c.name[0]}{c.surname[0]}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/vet/client/${c.id}`)}>
                  <p className="font-semibold text-gray-900">{c.surname} {c.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {c.phone && <span className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} /> {c.phone}</span>}
                    {c.email && <span className="text-xs text-gray-500 flex items-center gap-1"><Mail size={10} /> {c.email}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-500">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setShowDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                  <button onClick={() => navigate(`/vet/client/${c.id}`)} className="p-1.5 text-gray-300">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editingId ? t('vetEditClient') : t('vetNewClient')} onClose={closeModal}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('vetName')} *</label>
                <input className="input" placeholder="Mario" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('vetSurname')} *</label>
                <input className="input" placeholder="Rossi" value={form.surname} onChange={e => setForm(f => ({ ...f, surname: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><Phone size={12} className="inline mr-1" />{t('vetPhone')}</label>
              <input className="input" type="tel" placeholder="+39 333 123 4567" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><Mail size={12} className="inline mr-1" />{t('vetEmail')}</label>
              <input className="input" type="email" placeholder="mario@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vetAddress')}</label>
              <input className="input" placeholder="Via Roma 1, Milano" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vetCF')}</label>
              <input className="input" placeholder="RSSMRA80A01H501Z" value={form.codice_fiscale} onChange={e => setForm(f => ({ ...f, codice_fiscale: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📋 {t('vetNotes')}</label>
              <textarea className="input resize-none" rows={3} placeholder={t('vetNotesPlaceholder')} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button onClick={handleSave} disabled={!form.name || !form.surname || saving} className="btn-primary w-full disabled:opacity-40">
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </Modal>
      )}

      {showDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-bold text-gray-900 mb-2">{t('vetDeleteClientTitle')}</h2>
            <p className="text-sm text-gray-500 mb-5">{t('vetDeleteClientDesc')}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteId(null)} className="btn-secondary flex-1">{t('cancel')}</button>
              <button onClick={async () => { await remove(showDeleteId); setShowDeleteId(null) }} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl font-medium">
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
