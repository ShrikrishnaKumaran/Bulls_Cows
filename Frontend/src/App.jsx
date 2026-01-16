import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home'
import LoginForm from './features/auth/LoginForm'
import RegisterForm from './features/auth/RegisterForm'
import CreateRoom from './features/lobby/CreateRoom'
import JoinRoom from './features/lobby/JoinRoom'
import RoomWaiting from './features/lobby/RoomWaiting'
import UserProfile from './features/profile/UserProfile'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/lobby/create" element={<ProtectedRoute><CreateRoom /></ProtectedRoute>} />
        <Route path="/lobby/join" element={<ProtectedRoute><JoinRoom /></ProtectedRoute>} />
        <Route path="/lobby/room/:roomCode" element={<ProtectedRoute><RoomWaiting /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
