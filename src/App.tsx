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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()
  useNotifications(user)

  // Intercept Supabase recovery link (type=recovery in URL hash)
  if (window.location.hash.includes('type=recovery')) {
    return <ResetPasswordPage />
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/new-pet" element={<ProtectedRoute><NewPetPage /></ProtectedRoute>} />
      <Route path="/pet/:id" element={<ProtectedRoute><PetPage /></ProtectedRoute>} />
      <Route path="/vet" element={<ProtectedRoute><VetDashboardPage /></ProtectedRoute>} />
      <Route path="/vet/client/:clientId" element={<ProtectedRoute><VetClientPage /></ProtectedRoute>} />
      <Route path="/vet/client/:clientId/animal/:animalId" element={<ProtectedRoute><VetAnimalPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

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
