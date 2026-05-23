import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { getActionItems, toggleActionItemDone } from '../api/client'
import Navbar from '../components/Navbar'

export default function ActionItemsPage() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const teamName = location.state?.teamName || 'Team'

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getActionItems(teamId)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [teamId])

  async function handleToggle(item) {
    try {
      const updated = await toggleActionItemDone(teamId, item.id)
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    } catch (e) {
      setError(e.message)
    }
  }

  const open = items.filter((i) => !i.done)
  const done = items.filter((i) => i.done)

  return (
    <div className="page">
      <Navbar />
      <main className="container">
        <button className="btn-ghost" onClick={() => navigate(`/teams/${teamId}/boards`)}>
          ← Back to boards
        </button>
        <div className="page-header">
          <div className="ai-page-title">
            <div className="ai-page-icon">✅</div>
            <div>
              <h1>Action Items</h1>
              <p className="muted">{teamName}</p>
            </div>
          </div>
          <div className="ai-stats">
            <span className="ai-stat">
              <strong>{open.length}</strong> open
            </span>
            <span className="ai-stat ai-stat-done">
              <strong>{done.length}</strong> done
            </span>
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        {loading ? (
          <div className="loading">Loading action items…</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No action items yet</h3>
            <p>Cards added to an "Action Items" column in any board will appear here.</p>
          </div>
        ) : (
          <>
            {open.length > 0 && (
              <section className="ai-section">
                <h2 className="ai-section-title">Open</h2>
                <div className="ai-list">
                  {open.map((item) => (
                    <ActionItem key={item.id} item={item} onToggle={handleToggle} />
                  ))}
                </div>
              </section>
            )}

            {done.length > 0 && (
              <section className="ai-section">
                <h2 className="ai-section-title ai-section-title--done">
                  Done <span className="ai-done-count">{done.length}</span>
                </h2>
                <div className="ai-list">
                  {done.map((item) => (
                    <ActionItem key={item.id} item={item} onToggle={handleToggle} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function ActionItem({ item, onToggle }) {
  return (
    <div className={`ai-item${item.done ? ' ai-item--done' : ''}`}>
      <button
        className={`ai-checkbox${item.done ? ' ai-checkbox--checked' : ''}`}
        onClick={() => onToggle(item)}
        title={item.done ? 'Mark as open' : 'Mark as done'}
        aria-label={item.done ? 'Mark as open' : 'Mark as done'}
      >
        {item.done && '✓'}
      </button>
      <div className="ai-content">
        <p className="ai-body">{item.body}</p>
        <div className="ai-meta">
          <span className="ai-board-tag">📋 {item.board_title}</span>
          <span className="ai-author">by {item.author_name}</span>
          {item.vote_count > 0 && (
            <span className="ai-votes">👍 {item.vote_count}</span>
          )}
        </div>
      </div>
    </div>
  )
}
