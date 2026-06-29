import { useState } from 'react'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import { useExpenses } from '../../hooks/usePetData'
import { EXPENSE_CATEGORIES } from '../../lib/species'
import { type ExpenseCategory } from '../../types'
import Modal from '../ui/Modal'
import EmptyState from '../ui/EmptyState'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

const CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  vet: '🩺', food: '🍖', grooming: '✂️', toys: '🧸', medicine: '💊', other: '📦',
}

export default function ExpensesSection({ petId }: { petId: string }) {
  const { expenses, loading, add, remove } = useExpenses(petId)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ date: '', amount: '', category: 'vet' as ExpenseCategory, notes: '' })

  function resetForm() { setForm({ date: '', amount: '', category: 'vet', notes: '' }) }

  async function handleAdd() {
    await add({ date: form.date, amount: parseFloat(form.amount), category: form.category, notes: form.notes || null })
    setShowModal(false)
    resetForm()
  }

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Caricamento...</div>

  return (
    <div>
      {expenses.length > 0 && (
        <div className="bg-primary-50 rounded-xl p-3 flex items-center justify-between mb-3">
          <span className="text-sm text-primary-700 font-medium">Totale spese</span>
          <span className="text-lg font-bold text-primary-700">€ {total.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-end mb-3">
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-1">
          <Plus size={15} /> Aggiungi
        </button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Nessuna spesa registrata"
          description="Tieni traccia dei costi veterinari e di cura"
          action={{ label: 'Aggiungi spesa', onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="space-y-2">
          {expenses.map(e => {
            const cat = EXPENSE_CATEGORIES.find(c => c.value === e.category)
            return (
              <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                  {CATEGORY_EMOJI[e.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">€ {Number(e.amount).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{cat?.label} · {formatDate(e.date)}</p>
                  {e.notes && <p className="text-xs text-gray-400 truncate mt-0.5">{e.notes}</p>}
                </div>
                <button onClick={() => remove(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title="Aggiungi spesa" onClose={() => { setShowModal(false); resetForm() }}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Importo (€) *</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <div className="grid grid-cols-3 gap-1.5">
                {EXPENSE_CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setForm(f => ({ ...f, category: c.value }))}
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border text-xs transition-all ${
                      form.category === c.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{CATEGORY_EMOJI[c.value as ExpenseCategory]}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (opzionale)</label>
              <input className="input" placeholder="Descrizione..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button onClick={handleAdd} disabled={!form.date || !form.amount} className="btn-primary w-full disabled:opacity-40">
              Salva
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
