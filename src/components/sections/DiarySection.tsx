import { useState } from 'react'
import { Plus, Trash2, BookOpen } from 'lucide-react'
import { useDiaryEntries } from '../../hooks/usePetData'
import { useLang } from '../../context/LanguageContext'
import Modal from '../ui/Modal'
import EmptyState from '../ui/EmptyState'

function formatDate(d: string, lang: string) {
  return new Date(d).toLocaleDateString(lang === 'EN' ? 'en-GB' : 'it-IT', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
}

export default function DiarySection({ petId }: { petId: string }) {
  const { entries, loading, add, remove } = useDiaryEntries(petId)
  const { t, lang } = useLang()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], content: '' })

  async function handleAdd() {
    await add({ date: form.date, content: form.content })
    setShowModal(false)
    setForm({ date: new Date().toISOString().split('T')[0], content: '' })
  }

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">{t('loading')}</div>

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-1">
          <Plus size={15} /> {t('diaryNewBtn')}
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t('diaryEmpty')}
          description={t('diaryEmptyDesc')}
          action={{ label: t('diaryFirstBtn'), onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="space-y-2">
          {entries.map(e => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-primary-600 font-medium">{formatDate(e.date, lang)}</p>
                <button onClick={() => remove(e.id)} className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap leading-relaxed">{e.content}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={t('diaryModalTitle')} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('diaryNoteLabel')}</label>
              <textarea
                className="input resize-none"
                rows={5}
                placeholder={t('diaryNotePlaceholder')}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                autoFocus
              />
            </div>
            <button onClick={handleAdd} disabled={!form.content.trim()} className="btn-primary w-full disabled:opacity-40">
              {t('save')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
