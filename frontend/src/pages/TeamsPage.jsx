import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTeams, createTeam } from '../api/client'
import Navbar from '../components/Navbar'

export default function TeamsPage() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [newTeamName, setNewTeamName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newTeamName.trim()) return
    try {
      const team = await createTeam(newTeamName.trim())
      setTeams((prev) => [...prev, team])
      setNewTeamName('')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="page">
      <Navbar />
      <main className="container">
        <div className="page-header">
          <h1>Your Teams</h1>
        </div>

        <form onSubmit={handleCreate} className="inline-form">
          <input
            type="text"
            placeholder="New team name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Create team</button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        {loading ? (
          <div className="loading">Loading…</div>
        ) : teams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No teams yet</h3>
            <p>Create your first team to start running retrospectives.</p>
          </div>
        ) : (
          <div className="card-grid">
            {teams.map((team) => (
              <div
                key={team.id}
                className="team-card"
                onClick={() => navigate(`/teams/${team.id}/boards`)}
              >
                <div className="team-card-icon">👥</div>
                <h2>{team.name}</h2>
                <div className="team-card-meta">
                  <span>View boards →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
