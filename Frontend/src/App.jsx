import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home'
import AuthPage from './features/auth/AuthPage'
import CreateRoom from './features/lobby/CreateRoom'
import JoinRoom from './features/lobby/JoinRoom'
import RoomWaiting from './features/lobby/RoomWaiting'
import UserProfile from './features/profile/UserProfile'
import PassAndPlaySetup from './components/PassAndPlaySetup'
import OfflineGame from './components/OfflineGame'
import ToastContainer from './components/ui/ToastContainer'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/auth" replace />
  }
  
  return children
}

function App() {
  return (
    <BrowserRouter>
      {/* Global Toast Notifications */}
      <ToastContainer />
      
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/offline/setup" element={<PassAndPlaySetup />} />
        <Route path="/offline/game" element={<OfflineGame />} />
        <Route path="/lobby/create" element={<ProtectedRoute><CreateRoom /></ProtectedRoute>} />
        <Route path="/lobby/join" element={<ProtectedRoute><JoinRoom /></ProtectedRoute>} />
        <Route path="/lobby/room/:roomCode" element={<ProtectedRoute><RoomWaiting /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
