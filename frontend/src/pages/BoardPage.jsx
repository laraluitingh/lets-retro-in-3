import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { getColumns, createColumn, updateColumn, deleteColumn } from '../api/client'
import Navbar from '../components/Navbar'
import Column from '../components/Column'

export default function BoardPage() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const boardTitle = location.state?.boardTitle || 'Retrospective Board'
  const [columns, setColumns] = useState([])
  const [newColTitle, setNewColTitle] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddCol, setShowAddCol] = useState(false)

  useEffect(() => {
    getColumns(boardId)
      .then(setColumns)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [boardId])

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

  return (
    <div className="page">
      <Navbar />

      <div className="board-page-header">
        <button className="board-page-back" onClick={() => navigate(-1)}>← Back</button>
        <h1>{boardTitle}</h1>
        <button
          className="btn-secondary btn-sm"
          onClick={() => setShowAddCol((v) => !v)}
        >
          {showAddCol ? 'Cancel' : '+ Add column'}
        </button>
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
