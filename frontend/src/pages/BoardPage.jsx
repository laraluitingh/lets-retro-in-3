import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { getColumns, createColumn, updateColumn, deleteColumn, getBoardPreview, joinBoard } from '../api/client'
import Navbar from '../components/Navbar'
import Column from '../components/Column'

export default function BoardPage() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [boardTitle, setBoardTitle] = useState(location.state?.boardTitle || '')
  const [columns, setColumns] = useState([])
  const [newColTitle, setNewColTitle] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddCol, setShowAddCol] = useState(false)

  // Share button state
  const [copied, setCopied] = useState(false)

  // Join-board flow: null | { id, title, team_id, team_name }
  const [joinInfo, setJoinInfo] = useState(null)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    getColumns(boardId)
      .then((cols) => {
        setColumns(cols)
        // If we navigated directly (no title in state), pick it up from the first column's parent
        // but columns don't carry the board title – fetch preview for title if missing
        if (!boardTitle) {
          getBoardPreview(boardId).then((p) => setBoardTitle(p.title)).catch(() => {})
        }
      })
      .catch((e) => {
        if (e.status === 403) {
          // Not a member — fetch public preview so we can show the join UI
          getBoardPreview(boardId)
            .then(setJoinInfo)
            .catch(() => setError('Board not found.'))
        } else {
          setError(e.message)
        }
      })
      .finally(() => setLoading(false))
  }, [boardId])

  async function handleShare() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback for non-secure contexts
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  async function handleJoin() {
    setJoining(true)
    setJoinError('')
    try {
      await joinBoard(boardId)
      // Now reload the board
      setJoinInfo(null)
      setLoading(true)
      const cols = await getColumns(boardId)
      setColumns(cols)
      setBoardTitle(joinInfo.title)
    } catch (e) {
      setJoinError(e.message)
    } finally {
      setJoining(false)
      setLoading(false)
    }
  }

  async function handleAddColumn(e) {
    e.preventDefault()
    if (!newColTitle.trim()) return
    try {
      const col = await createColumn(boardId, newColTitle.trim(), columns.length)
      setColumns((prev) => [...prev, col])
      setNewColTitle('')
      setShowAddCol(false)
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleRenameColumn(columnId, title) {
    try {
      const updated = await updateColumn(boardId, columnId, { title })
      setColumns((prev) => prev.map((c) => (c.id === columnId ? updated : c)))
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDeleteColumn(columnId) {
    if (!confirm('Delete this column and all its cards?')) return
    try {
      await deleteColumn(boardId, columnId)
      setColumns((prev) => prev.filter((c) => c.id !== columnId))
    } catch (e) {
      setError(e.message)
    }
  }

  // ── Join-board screen ─────────────────────────────────────────────────────
  if (!loading && joinInfo) {
    return (
      <div className="page">
        <Navbar />
        <div className="join-board-page">
          <div className="join-board-card">
            <div className="join-board-icon">🔗</div>
            <h2>You've been invited to a board</h2>
            <p className="join-board-meta">
              <strong>{joinInfo.title}</strong> is on the team <strong>{joinInfo.team_name}</strong>.
              Join the team to view and collaborate on this board.
            </p>
            {joinError && <p className="error-msg">{joinError}</p>}
            <div className="join-board-actions">
              <button
                className="btn-primary join-btn"
                onClick={handleJoin}
                disabled={joining}
              >
                {joining ? 'Joining…' : `Join "${joinInfo.team_name}"`}
              </button>
              <button className="btn-ghost-sm" onClick={() => navigate('/teams')}>
                Go to my teams
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Normal board view ─────────────────────────────────────────────────────
  return (
    <div className="page">
      <Navbar />

      <div className="board-page-header">
        <button className="board-page-back" onClick={() => navigate(-1)}>← Back</button>
        <h1>{boardTitle || 'Retrospective Board'}</h1>
        <div className="board-page-actions">
          <button className="btn-share" onClick={handleShare}>
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
          <button
            className="btn-secondary btn-sm"
            onClick={() => setShowAddCol((v) => !v)}
          >
            {showAddCol ? 'Cancel' : '+ Add column'}
          </button>
        </div>
      </div>

      {showAddCol && (
        <form onSubmit={handleAddColumn} className="add-col-form">
          <input
            type="text"
            placeholder="Column title…"
            value={newColTitle}
            onChange={(e) => setNewColTitle(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-secondary">Add</button>
        </form>
      )}

      {error && (
        <div style={{ padding: '0 1.5rem' }}>
          <p className="error-msg">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading board…</div>
      ) : (
        <div className="board-container">
          <div className="board">
            {columns.map((col, i) => (
              <Column
                key={col.id}
                column={col}
                colorIndex={i}
                onRename={handleRenameColumn}
                onDelete={handleDeleteColumn}
              />
            ))}
            {columns.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>No columns yet</h3>
                <p>Click "+ Add column" to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

