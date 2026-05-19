import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateCard, deleteCard, toggleVote } from '../api/client'

export default function CardItem({ card, columnId, onUpdate, onDelete }) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(card.body)
  const [voted, setVoted] = useState(false)
  const isOwn = user?.id === card.author_id

  async function handleSave() {
    if (!body.trim()) return
    try {
      const updated = await updateCard(columnId, card.id, body.trim())
      onUpdate(updated)
      setEditing(false)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this card?')) return
    try {
      await deleteCard(columnId, card.id)
      onDelete(card.id)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleVote() {
    try {
      const result = await toggleVote(card.id)
      setVoted((v) => !v)
      onUpdate({ ...card, vote_count: result.vote_count })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="card">
      {editing ? (
        <div className="card-edit">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            autoFocus
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave() }
              if (e.key === 'Escape') { setEditing(false); setBody(card.body) }
            }}
          />
          <div className="card-edit-actions">
            <button className="btn-primary btn-sm" onClick={handleSave}>Save</button>
            <button className="btn-ghost-sm" onClick={() => { setEditing(false); setBody(card.body) }}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <p className="card-body">{card.body}</p>
          <div className="card-footer">
            <span className="card-author">{card.author_name}</span>
            <div className="card-actions">
              <button
                className={`btn-vote${voted ? ' voted' : ''}`}
                onClick={handleVote}
                title={voted ? 'Remove vote' : 'Vote'}
              >
                👍 {card.vote_count}
              </button>
              {isOwn && (
                <>
                  <button className="btn-icon" onClick={() => setEditing(true)} title="Edit">✏️</button>
                  <button className="btn-icon" onClick={handleDelete} title="Delete">🗑️</button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
