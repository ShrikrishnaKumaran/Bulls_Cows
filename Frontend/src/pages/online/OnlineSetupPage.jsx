/**
 * OnlineSetupPage - Online Mode Setup (Mission Briefing)
 * 
 * Uses the same ConfigStep component as offline mode for consistent UX.
 * After config is set, creates the room and navigates to waiting room.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import useOnlineGameStore from '../../store/useOnlineGameStore';
import { ConfigStep } from '../../components/setup';
import { Loader } from '../../components/ui';

const OnlineSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, connected, reconnect } = useSocket();
  const { createRoom, setupListeners, removeListeners, resetState } = useOnlineGameStore();
  
  // Check if we're inviting a friend from profile page
  const inviteFriend = location.state?.inviteFriend || null;
  
  const [config, setConfig] = useState({
    digits: 4,
    difficulty: 'Easy',
    format: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Reset any previous game state and set up listeners on mount
  useEffect(() => {
    resetState();
    setupListeners();
    return () => removeListeners();
  }, [resetState, setupListeners, removeListeners]);

  // Track when socket is ready
  useEffect(() => {
    if (connected) {
      setIsInitializing(false);
      setError(''); // Clear any connection errors
    }
  }, [connected]);

  // Set a timeout for initial connection
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isInitializing && !connected) {
        setIsInitializing(false);
        // Don't show error yet, just let user try
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isInitializing, connected]);

  // Auto-reconnect if disconnected
  useEffect(() => {
    if (!connected && socket) {
      reconnect();
    }
  }, [connected, socket, reconnect]);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleNext = () => {
    // Clear previous errors
    setError('');
    
    // Check connection - but be more lenient
    if (!connected) {
      setError('Connecting to server... Please wait a moment and try again.');
      if (socket) reconnect();
      return;
    }

    setLoading(true);
    setError('');

    // Convert config to backend format
    const settings = {
      format: config.format,
      digits: config.digits,
      difficulty: config.difficulty.toLowerCase(), // Backend expects lowercase
    };

    // Create the room with the selected settings
    createRoom(settings, (response) => {
      setLoading(false);
      
      if (response && response.success) {
        // Navigate to waiting room, passing inviteFriend if present
        navigate(`/lobby/room/${response.room.roomCode}`, {
          state: inviteFriend ? { inviteFriend } : undefined
        });
      } else {
        setError(response?.message || 'Failed to create room');
      }
    });
  };

  // Show loading overlay while creating room or initially connecting
  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <Loader text="Creating room..." />
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <Loader text="Connecting to server..." />
      </div>
    );
  }

  return (
    <>
      {/* Connection error banner */}
      {error && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/90 text-white px-4 py-3 text-center text-sm">
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-4 underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Connection status banner - only show if disconnected after initial load */}
      {!connected && !error && !isInitializing && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800/95 text-slate-300 px-4 py-2 text-center text-sm border-b border-slate-700">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
            Reconnecting to server...
          </span>
        </div>
      )}
      
      <ConfigStep
        config={config}
        onConfigChange={handleConfigChange}
        onBack={handleBack}
        onNext={handleNext}
      />
    </>
  );
};

export default OnlineSetupPage;
