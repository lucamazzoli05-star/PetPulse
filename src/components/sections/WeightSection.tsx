import { useState } from 'react'
import { Plus, Trash2, Scale } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useWeightEntries } from '../../hooks/usePetData'
import Modal from '../ui/Modal'
import EmptyState from '../ui/EmptyState'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
}

export default function WeightSection({ petId }: { petId: string }) {
  const { entries, loading, add, remove } = useWeightEntries(petId)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], weight_kg: '', notes: '' })

  async function handleAdd() {
    await add({ date: form.date, weight_kg: parseFloat(form.weight_kg), notes: form.notes || null })
    setShowModal(false)
    setForm({ date: new Date().toISOString().split('T')[0], weight_kg: '', notes: '' })
  }

  const chartData = entries.map(e => ({ date: formatDate(e.date), peso: Number(e.weight_kg) }))

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Caricamento...</div>

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-1">
          <Plus size={15} /> Aggiungi
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Nessuna misurazione"
          description="Registra il peso per tenere traccia nel tempo"
          action={{ label: 'Prima misurazione', onClick: () => setShowModal(true) }}
        />
      ) : (
        <>
          {entries.length >= 2 && (
            <div className="bg-white rounded-xl border border-gray-100 p-3 mb-3">
              <p className="text-xs text-gray-500 mb-2 font-medium">Andamento peso (kg)</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip formatter={(v) => [`${v} kg`, 'Peso']} />
                  <Line type="monotone" dataKey="peso" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="space-y-2">
            {[...entries].reverse().map(e => (
              <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Scale size={16} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{Number(e.weight_kg).toFixed(2)} kg</p>
                  <p className="text-xs text-gray-500">{formatDate(e.date)}</p>
                  {e.notes && <p className="text-xs text-gray-400 truncate">{e.notes}</p>}
                </div>
                <button onClick={() => remove(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <Modal title="Registra peso" onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) *</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="es. 4.5" value={form.weight_kg} onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (opzionale)</label>
              <input className="input" placeholder="Es. dopo la visita..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button onClick={handleAdd} disabled={!form.date || !form.weight_kg} className="btn-primary w-full disabled:opacity-40">
              Salva
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
