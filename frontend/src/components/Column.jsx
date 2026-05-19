import { useEffect, useState } from 'react'
import { getCards, createCard } from '../api/client'
import CardItem from './CardItem'

const ACCENT_COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

export default function Column({ column, colorIndex = 0, onRename, onDelete }) {
  const [cards, setCards] = useState([])
  const [newBody, setNewBody] = useState('')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(column.title)
  const accent = ACCENT_COLORS[colorIndex % ACCENT_COLORS.length]

  useEffect(() => {
    getCards(column.id).then(setCards).catch(console.error)
  }, [column.id])

  async function handleAddCard(e) {
    e.preventDefault()
    if (!newBody.trim()) return
    try {
      const card = await createCard(column.id, newBody.trim())
      setCards((prev) => [...prev, card])
      setNewBody('')
      setAdding(false)
    } catch (e) {
      console.error(e)
    }
  }

  function handleCardUpdate(updated) {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  function handleCardDelete(cardId) {
    setCards((prev) => prev.filter((c) => c.id !== cardId))
  }

  async function handleRenameSubmit(e) {
    e.preventDefault()
    await onRename(column.id, title)
    setEditing(false)
  }

  return (
    <div className="column">
      <div className="column-accent" style={{ background: accent }} />
      <div className="column-inner">
        <div className="column-header">
          <div className="column-title-wrap">
            {editing ? (
              <form onSubmit={handleRenameSubmit} className="rename-form">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  onBlur={handleRenameSubmit}
                />
              </form>
            ) : (
              <h2 onClick={() => setEditing(true)} title="Click to rename">{column.title}</h2>
            )}
            <span className="column-count">{cards.length}</span>
          </div>
          <button className="btn-icon" onClick={() => onDelete(column.id)} title="Delete column">✕</button>
        </div>

        <div className="cards-list">
          {cards
            .sort((a, b) => b.vote_count - a.vote_count)
            .map((card) => (
              <CardItem
                key={card.id}
                card={card}
                columnId={column.id}
                onUpdate={handleCardUpdate}
                onDelete={handleCardDelete}
              />
            ))}
        </div>

        {adding ? (
          <form onSubmit={handleAddCard} className="add-card-form">
            <textarea
              placeholder="What's on your mind?"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={3}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(e) }
                if (e.key === 'Escape') { setAdding(false); setNewBody('') }
              }}
            />
            <div className="add-card-actions">
              <button type="submit" className="btn-secondary btn-sm">Add card</button>
              <button type="button" className="btn-ghost-sm" onClick={() => { setAdding(false); setNewBody('') }}>Cancel</button>
            </div>
          </form>
        ) : (
          <button className="add-card-toggle" onClick={() => setAdding(true)}>
            + Add a card
          </button>
        )}
      </div>
    </div>
  )
}
