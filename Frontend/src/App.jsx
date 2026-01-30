import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

// Pages - Auth
import AuthPage from './pages/auth/AuthPage'

// Pages - Home
import HomePage from './pages/home/HomePage'

// Pages - Profile
import ProfilePage from './pages/profile/ProfilePage'

// Pages - Offline
import SetupPage from './pages/offline/SetupPage'
import OfflineGamePage from './pages/offline/GamePage'

// Pages - Online Lobby
import CreateRoomPage from './pages/online/CreateRoomPage'
import JoinRoomPage from './pages/online/JoinRoomPage'
import RoomWaitingPage from './pages/online/RoomWaitingPage'
import LobbyPage from './pages/online/LobbyPage'
import OnlineGamePage from './pages/online/OnlineGamePage'
import OnlineSetupPage from './pages/online/OnlineSetupPage'

// UI Components
import ToastContainer from './components/ui/ToastContainer'

// Store
import useAuthStore from './store/useAuthStore'

// Protected Route Component - Only checks localStorage directly to avoid hydration issues
const ProtectedRoute = ({ children }) => {
  // Always check localStorage directly - it's synchronous and reliable
  const localToken = localStorage.getItem('token')
  
  // Validate token - must exist and be a proper JWT format
  if (!localToken || localToken === 'undefined' || localToken === 'null' || !localToken.startsWith('eyJ')) {
    // Clean up invalid tokens
    if (localToken === 'undefined' || localToken === 'null') {
      localStorage.removeItem('token')
    }
    return <Navigate to="/auth" replace />
  }
  
  return children
}

function App() {
  const { initialize } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize auth state on app start
    initialize()
    setIsInitialized(true)
  }, [initialize])

  // Show nothing while initializing to prevent flash
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      {/* Global Toast Notifications */}
      <ToastContainer />
      
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/offline/setup" element={<SetupPage />} />
        <Route path="/offline/game" element={<OfflineGamePage />} />
        <Route path="/online/setup" element={<ProtectedRoute><OnlineSetupPage /></ProtectedRoute>} />
        <Route path="/lobby/create" element={<ProtectedRoute><CreateRoomPage /></ProtectedRoute>} />
        <Route path="/lobby/join" element={<ProtectedRoute><JoinRoomPage /></ProtectedRoute>} />
        <Route path="/lobby/room/:roomCode" element={<ProtectedRoute><RoomWaitingPage /></ProtectedRoute>} />
        <Route path="/lobby/:roomCode" element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
        <Route path="/game/online/:roomCode" element={<ProtectedRoute><OnlineGamePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
