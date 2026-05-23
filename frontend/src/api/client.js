const BASE_URL = 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    const error = new Error(err.detail || 'Request failed')
    error.status = res.status
    throw error
  }
  if (res.status === 204) return null
  return res.json()
}

// Auth
export const registerUser = (data) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(data) })

export const loginUser = (email, password) => {
  const body = new URLSearchParams({ username: email, password })
  return fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }))
      throw new Error(err.detail)
    }
    return res.json()
  })
}

export const getMe = () => request('/auth/me')

// Teams
export const getTeams = () => request('/teams/')
export const createTeam = (name) =>
  request('/teams/', { method: 'POST', body: JSON.stringify({ name }) })
export const getTeamMembers = (teamId) => request(`/teams/${teamId}/members`)
export const inviteMember = (teamId, email) =>
  request(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify({ email }) })
export const removeMember = (teamId, userId) =>
  request(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' })

// Boards
export const getBoards = (teamId) => request(`/teams/${teamId}/boards/`)
export const createBoard = (teamId, title) =>
  request(`/teams/${teamId}/boards/`, { method: 'POST', body: JSON.stringify({ title }) })
export const deleteBoard = (teamId, boardId) =>
  request(`/teams/${teamId}/boards/${boardId}`, { method: 'DELETE' })

// Columns
export const getColumns = (boardId) => request(`/boards/${boardId}/columns/`)
export const createColumn = (boardId, title, position) =>
  request(`/boards/${boardId}/columns/`, { method: 'POST', body: JSON.stringify({ title, position }) })
export const updateColumn = (boardId, columnId, data) =>
  request(`/boards/${boardId}/columns/${columnId}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteColumn = (boardId, columnId) =>
  request(`/boards/${boardId}/columns/${columnId}`, { method: 'DELETE' })

// Cards
export const getCards = (columnId) => request(`/columns/${columnId}/cards/`)
export const createCard = (columnId, body) =>
  request(`/columns/${columnId}/cards/`, { method: 'POST', body: JSON.stringify({ body }) })
export const updateCard = (columnId, cardId, body) =>
  request(`/columns/${columnId}/cards/${cardId}`, { method: 'PATCH', body: JSON.stringify({ body }) })
export const deleteCard = (columnId, cardId) =>
  request(`/columns/${columnId}/cards/${cardId}`, { method: 'DELETE' })

// Votes
export const toggleVote = (cardId) =>
  request(`/cards/${cardId}/vote/`, { method: 'POST' })

// Board sharing
export const getBoardPreview = (boardId) =>
  fetch(`${BASE_URL}/boards/${boardId}/preview`).then(async (res) => {
    if (!res.ok) throw new Error('Board not found')
    return res.json()
  })

export const joinBoard = (boardId) =>
  request(`/boards/${boardId}/join`, { method: 'POST' })

// Action items
export const getActionItems = (teamId) => request(`/teams/${teamId}/action-items`)
export const toggleActionItemDone = (teamId, cardId) =>
  request(`/teams/${teamId}/action-items/${cardId}/toggle-done`, { method: 'PATCH' })
