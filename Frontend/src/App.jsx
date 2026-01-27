import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

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
import OnlineGamePage from './pages/online/GamePage'

// UI Components
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
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/offline/setup" element={<SetupPage />} />
        <Route path="/offline/game" element={<OfflineGamePage />} />
        <Route path="/lobby/create" element={<ProtectedRoute><CreateRoomPage /></ProtectedRoute>} />
        <Route path="/lobby/join" element={<ProtectedRoute><JoinRoomPage /></ProtectedRoute>} />
        <Route path="/lobby/room/:roomCode" element={<ProtectedRoute><RoomWaitingPage /></ProtectedRoute>} />
        <Route path="/game/online/:roomCode" element={<ProtectedRoute><OnlineGamePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
