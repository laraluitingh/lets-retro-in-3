import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <span className="navbar-brand" onClick={() => navigate('/teams')}>
        <span className="navbar-brand-icon">🔄</span>
        Retro in 3
      </span>
      {user && (
        <div className="navbar-right">
          <div className="navbar-user">
            <div className="navbar-avatar">{initials(user.name)}</div>
            <span>{user.name}</span>
          </div>
          <button className="btn-ghost-sm" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  )
}
