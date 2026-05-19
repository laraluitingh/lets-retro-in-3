import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TeamsPage from './pages/TeamsPage'
import BoardsPage from './pages/BoardsPage'
import BoardPage from './pages/BoardPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Loading…</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/teams" element={<PrivateRoute><TeamsPage /></PrivateRoute>} />
      <Route path="/teams/:teamId/boards" element={<PrivateRoute><BoardsPage /></PrivateRoute>} />
      <Route path="/boards/:boardId" element={<PrivateRoute><BoardPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
