// ─────────────────────────────────────────────
// App.tsx — punto di ingresso dell'applicazione
// Qui si definiscono tutte le "pagine" dell'app
// e le regole di navigazione tra di esse.
// ─────────────────────────────────────────────

// "import" = importa strumenti/componenti da usare in questo file
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { useNotifications } from './hooks/useNotifications'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import NewPetPage from './pages/NewPetPage'
import PetPage from './pages/PetPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VetDashboardPage from './pages/vet/VetDashboardPage'
import VetClientPage from './pages/vet/VetClientPage'
import VetAnimalPage from './pages/vet/VetAnimalPage'
import Spinner from './components/ui/Spinner'

// ProtectedRoute = "guardia" che blocca le pagine se non sei loggato.
// Se l'utente NON è loggato, lo manda alla pagina di login (/auth).
// "children" = la pagina che si vuole proteggere (passata dall'esterno).
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth() // legge se c'è un utente loggato
  if (loading) return (              // mentre carica, mostra uno spinner (cerchio di caricamento)
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
  if (!user) return <Navigate to="/auth" replace /> // non loggato → vai al login
  return <>{children}</>                             // loggato → mostra la pagina richiesta
}

// AppRoutes = definisce quale pagina mostrare in base all'URL
function AppRoutes() {
  const { user, loading } = useAuth()
  useNotifications(user) // attiva le notifiche browser (vaccini, promemoria diario)

  // Se nell'URL c'è "type=recovery" (link di reset password ricevuto via email),
  // mostra subito la pagina per impostare la nuova password
  if (window.location.hash.includes('type=recovery')) {
    return <ResetPasswordPage />
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  return (
    // Routes = contenitore di tutte le "strade" (URL) dell'app
    <Routes>
      {/* /auth = pagina login/registrazione. Se già loggato, manda alla home */}
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />

      {/* / = home (lista animali o profilo vet). Protetta: devi essere loggato */}
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

      {/* /new-pet = pagina per aggiungere un nuovo animale */}
      <Route path="/new-pet" element={<ProtectedRoute><NewPetPage /></ProtectedRoute>} />

      {/* /pet/:id = pagina del singolo animale (:id cambia per ogni animale) */}
      <Route path="/pet/:id" element={<ProtectedRoute><PetPage /></ProtectedRoute>} />

      {/* /vet = dashboard veterinario (lista clienti) */}
      <Route path="/vet" element={<ProtectedRoute><VetDashboardPage /></ProtectedRoute>} />

      {/* /vet/client/:clientId = pagina del singolo cliente con i suoi animali */}
      <Route path="/vet/client/:clientId" element={<ProtectedRoute><VetClientPage /></ProtectedRoute>} />

      {/* /vet/client/:clientId/animal/:animalId = pagina del singolo animale del vet */}
      <Route path="/vet/client/:clientId/animal/:animalId" element={<ProtectedRoute><VetAnimalPage /></ProtectedRoute>} />

      {/* Qualsiasi altro URL non riconosciuto → torna alla home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// App = il "guscio" principale dell'intera applicazione.
// Avvolge tutto in tre "contenitori" che rendono disponibili:
//   - BrowserRouter: la navigazione tra pagine
//   - LanguageProvider: la lingua (IT/EN)
//   - AuthProvider: le informazioni sull'utente loggato
export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
