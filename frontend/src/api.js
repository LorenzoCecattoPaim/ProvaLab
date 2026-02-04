const API_URL = 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('access_token')
}

function setToken(token) {
  localStorage.setItem('access_token', token)
}

function removeToken() {
  localStorage.removeItem('access_token')
}

function getUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
}

function removeUser() {
  localStorage.removeItem('user')
}

async function request(endpoint, options = {}) {
  const token = getToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  })
  
  if (response.status === 401) {
    removeToken()
    removeUser()
    window.location.href = '/login'
    throw new Error('Sessão expirada')
  }
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Erro na requisição')
  }
  
  if (response.status === 204) {
    return null
  }
  
  return response.json()
}

// Auth API
export async function register(email, password) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  setToken(data.access_token)
  setUser(data.user)
  return data
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  setToken(data.access_token)
  setUser(data.user)
  return data
}

export function logout() {
  removeToken()
  removeUser()
}

export function isAuthenticated() {
  return !!getToken()
}

export function getCurrentUser() {
  return getUser()
}

// Exercises API
export async function getExercises(filters = {}) {
  const params = new URLSearchParams()
  if (filters.difficulty) params.append('difficulty', filters.difficulty)
  if (filters.subject) params.append('subject', filters.subject)
  
  const query = params.toString()
  return request(`/exercises${query ? '?' + query : ''}`)
}

export async function getExercise(id) {
  return request(`/exercises/${id}`)
}

export async function createExercise(data) {
  return request('/exercises', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function updateExercise(id, data) {
  return request(`/exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function deleteExercise(id) {
  return request(`/exercises/${id}`, {
    method: 'DELETE'
  })
}
