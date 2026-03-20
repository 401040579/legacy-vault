import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import LandingPage from './pages/LandingPage'
import SetupPage from './pages/SetupPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PasswordsPage from './pages/PasswordsPage'
import NotesPage from './pages/NotesPage'
import InheritancePage from './pages/InheritancePage'
import TimeCapsulePage from './pages/TimeCapsulePage'
import EmergencyPage from './pages/EmergencyPage'
import AuditPage from './pages/AuditPage'
import AppLayout from './components/AppLayout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isSetupComplete } = useStore()
  if (!isSetupComplete) return <Navigate to="/setup" replace />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  const { isSetupComplete, isAuthenticated } = useStore()

  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> :
        isSetupComplete ? <Navigate to="/login" replace /> :
        <LandingPage />
      } />
      <Route path="/setup" element={
        isSetupComplete ? <Navigate to="/login" replace /> : <SetupPage />
      } />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> :
        !isSetupComplete ? <Navigate to="/" replace /> :
        <LoginPage />
      } />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/passwords" element={<PasswordsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/inheritance" element={<InheritancePage />} />
        <Route path="/capsules" element={<TimeCapsulePage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/audit" element={<AuditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
