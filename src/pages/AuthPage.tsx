import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { HeartPulse } from 'lucide-react'

type Mode = 'login' | 'signup' | 'forgot'

export default function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  function switchMode(m: Mode) {
    setMode(m)
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError('Email o password non corretti.')
    } else if (mode === 'signup') {
      const { error } = await signUp(email, password, fullName)
      if (error) setError('Registrazione fallita. Prova con un\'altra email.')
      else setSuccess('Controlla la tua email per confermare l\'account.')
    } else {
      const { error } = await resetPassword(email)
      if (error) setError('Invio fallito. Controlla l\'email inserita.')
      else setSuccess('Email inviata! Controlla la tua casella e clicca il link per reimpostare la password.')
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
          <p className="text-gray-500 text-sm mt-1">La salute del tuo animale, sempre con te</p>
        </div>

        <div className="card">
          {mode !== 'forgot' && (
            <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
              {(['login', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    mode === m ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {m === 'login' ? 'Accedi' : 'Registrati'}
                </button>
              ))}
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mb-5">
              <h2 className="font-semibold text-gray-900 mb-1">Recupera password</h2>
              <p className="text-sm text-gray-500">Inserisci la tua email e ti mandiamo un link per reimpostare la password.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  className="input"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="Il tuo nome"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tua@email.com"
              />
            </div>
            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            )}

            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 disabled:opacity-60"
            >
              {loading
                ? 'Caricamento...'
                : mode === 'login'
                ? 'Accedi'
                : mode === 'signup'
                ? 'Crea account'
                : 'Invia link di recupero'}
            </button>
          </form>

          {mode === 'login' && (
            <button
              onClick={() => switchMode('forgot')}
              className="w-full text-center text-sm text-primary-600 mt-3 hover:underline"
            >
              Password dimenticata?
            </button>
          )}

          {mode === 'forgot' && (
            <button
              onClick={() => switchMode('login')}
              className="w-full text-center text-sm text-gray-500 mt-3 hover:underline"
            >
              Torna al login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
