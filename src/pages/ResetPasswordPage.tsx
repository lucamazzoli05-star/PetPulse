import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLang } from '../context/LanguageContext'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError(t('resetPasswordMismatch'))
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(t('resetPasswordError'))
    } else {
      setDone(true)
      setTimeout(() => navigate('/'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary-600 rounded-2xl p-3 mb-3">
            <HeartPulse size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PetPulse</h1>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-1">{t('resetPasswordTitle')}</h2>
          <p className="text-sm text-gray-500 mb-5">{t('resetPasswordDesc')}</p>

          {done ? (
            <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-3 text-center">{t('resetPasswordDone')}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('resetPasswordNew')}</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('resetPasswordConfirm')}</label>
                <input
                  className="input"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-60"
              >
                {loading ? t('loading') : t('resetPasswordSave')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
