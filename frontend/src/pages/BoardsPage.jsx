import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { getBoards, createBoard, deleteBoard } from '../api/client'
import Navbar from '../components/Navbar'

export default function BoardsPage() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [boards, setBoards] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBoards(teamId)
      .then(setBoards)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [teamId])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      const board = await createBoard(teamId, newTitle.trim())
      setBoards((prev) => [...prev, board])
      setNewTitle('')
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(boardId) {
    if (!confirm('Delete this board?')) return
    try {
      await deleteBoard(teamId, boardId)
      setBoards((prev) => prev.filter((b) => b.id !== boardId))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="page">
      <Navbar />
      <main className="container">
        <button className="btn-ghost" onClick={() => navigate('/teams')}>← Back to teams</button>
        <div className="page-header">
          <h1>Boards</h1>
          <button
            className="btn-action-items"
            onClick={() => navigate(`/teams/${teamId}/action-items`, { state: { teamName: location.state?.teamName } })}
          >
            ✅ Action Items
          </button>
        </div>

        <form onSubmit={handleCreate} className="inline-form">
          <input
            type="text"
            placeholder="New board title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Create board</button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        {loading ? (
          <div className="loading">Loading…</div>
        ) : boards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📌</div>
            <h3>No boards yet</h3>
            <p>Create your first retrospective board above.</p>
          </div>
        ) : (
          <div className="card-grid">
            {boards.map((board) => (
              <div key={board.id} className="board-card">
                <div className="board-card-accent" />
                <div
                  className="board-card-body"
                  onClick={() => navigate(`/boards/${board.id}`, { state: { boardTitle: board.title } })}
                >
                  <h2>{board.title}</h2>
                  <span className="muted">Open board →</span>
                </div>
                <div className="board-card-footer">
                  <button
                    className="btn-danger-sm"
                    onClick={(e) => { e.stopPropagation(); handleDelete(board.id) }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
