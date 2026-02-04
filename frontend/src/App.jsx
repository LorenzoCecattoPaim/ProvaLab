import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { isAuthenticated, logout, getCurrentUser } from './api'
import Login from './pages/Login'
import Register from './pages/Register'
import Exercises from './pages/Exercises'

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

function Header() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  
  function handleLogout() {
    logout()
    navigate('/login')
  }
  
  if (!isAuthenticated()) {
    return null
  }
  
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/exercises" className="logo">
          📚 Plataforma de Exercícios
        </Link>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/exercises" 
            element={
              <ProtectedRoute>
                <Exercises />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/exercises" replace />} />
          <Route path="*" element={<Navigate to="/exercises" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
