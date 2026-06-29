import { useState } from 'react'
import { Plus, Trash2, Bell, AlertCircle } from 'lucide-react'
import { useVaccines } from '../../hooks/usePetData'
import Modal from '../ui/Modal'
import EmptyState from '../ui/EmptyState'

const REMINDER_PRESETS = [
  { label: '1 giorno prima', value: 1 },
  { label: '3 giorni prima', value: 3 },
  { label: '7 giorni prima', value: 7 },
  { label: '14 giorni prima', value: 14 },
  { label: '30 giorni prima', value: 30 },
]

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function VaccinesSection({ petId }: { petId: string }) {
  const { vaccines, loading, add, remove } = useVaccines(petId)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '', date: '', expiry_date: '', reminder_days: 7, notes: '', useCustomReminder: false, customReminder: '',
  })

  function resetForm() {
    setForm({ name: '', date: '', expiry_date: '', reminder_days: 7, notes: '', useCustomReminder: false, customReminder: '' })
  }

  async function handleAdd() {
    const reminderDays = form.useCustomReminder ? parseInt(form.customReminder) || 7 : form.reminder_days
    await add({
      name: form.name,
      date: form.date,
      expiry_date: form.expiry_date || null,
      reminder_days: reminderDays,
      notes: form.notes || null,
    })
    setShowModal(false)
    resetForm()
  }

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Caricamento...</div>

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-1">
          <Plus size={15} /> Aggiungi
        </button>
      </div>

      {vaccines.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nessun vaccino registrato"
          description="Aggiungi vaccini e scadenze per ricevere promemoria"
          action={{ label: 'Aggiungi vaccino', onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="space-y-2">
          {vaccines.map(v => {
            const expDays = v.expiry_date ? daysUntil(v.expiry_date) : null
            const isExpiring = expDays !== null && expDays <= v.reminder_days && expDays > 0
            const isExpired = expDays !== null && expDays <= 0

            return (
              <div key={v.id} className={`rounded-xl border p-3 ${
                isExpired ? 'border-red-200 bg-red-50' : isExpiring ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-gray-900 truncate">{v.name}</p>
                      {(isExpiring || isExpired) && (
                        <AlertCircle size={14} className={isExpired ? 'text-red-500' : 'text-amber-500'} />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Somministrato: {formatDate(v.date)}</p>
                    {v.expiry_date && (
                      <p className={`text-xs mt-0.5 font-medium ${
                        isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-gray-500'
                      }`}>
                        {isExpired
                          ? `Scaduto ${Math.abs(expDays!)} giorn${Math.abs(expDays!) === 1 ? 'o' : 'i'} fa`
                          : isExpiring
                          ? `Scade tra ${expDays} giorn${expDays === 1 ? 'o' : 'i'}`
                          : `Scadenza: ${formatDate(v.expiry_date)}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      <Bell size={10} className="inline mr-0.5" />
                      Promemoria {v.reminder_days} giorn{v.reminder_days === 1 ? 'o' : 'i'} prima
                    </p>
                  </div>
                  <button onClick={() => remove(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
                {v.notes && <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">{v.notes}</p>}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title="Aggiungi vaccino / scadenza" onClose={() => { setShowModal(false); resetForm() }}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input className="input" placeholder="Es. Antirabbica, Visita annuale..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data somministrazione *</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data scadenza (opzionale)</label>
              <input className="input" type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Promemoria</label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {REMINDER_PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setForm(f => ({ ...f, reminder_days: p.value, useCustomReminder: false, customReminder: '' }))}
                    className={`text-xs py-1.5 px-2 rounded-lg border transition-all ${
                      !form.useCustomReminder && form.reminder_days === p.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  onClick={() => setForm(f => ({ ...f, useCustomReminder: true }))}
                  className={`text-xs py-1.5 px-2 rounded-lg border transition-all ${
                    form.useCustomReminder
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Personalizzato
                </button>
              </div>
              {form.useCustomReminder && (
                <div className="flex items-center gap-2">
                  <input
                    className="input w-24 text-center"
                    type="number"
                    min="1"
                    max="365"
                    placeholder="es. 10"
                    value={form.customReminder}
                    onChange={e => setForm(f => ({ ...f, customReminder: e.target.value }))}
                  />
                  <span className="text-sm text-gray-500">giorni prima della scadenza</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (opzionale)</label>
              <textarea className="input resize-none" rows={2} placeholder="Annotazioni..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button
              onClick={handleAdd}
              disabled={!form.name || !form.date}
              className="btn-primary w-full disabled:opacity-40"
            >
              Salva
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
