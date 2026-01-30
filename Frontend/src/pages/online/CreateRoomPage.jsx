/**
 * CreateRoomPage - Create a new game room with customizable settings
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import useOnlineGameStore from '../../store/useOnlineGameStore';

// Back Icon
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
  </svg>
);

const CreateRoomPage = () => {
  const [settings, setSettings] = useState({
    format: 3,
    digits: 4,
    difficulty: 'easy',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { socket, connected, reconnect } = useSocket();
  const navigate = useNavigate();
  
  // Use online game store for creating room
  const { createRoom, setupListeners, removeListeners, resetState } = useOnlineGameStore();

  // Reset any previous game state and set up listeners on mount
  useEffect(() => {
    resetState();
    setupListeners();
    return () => removeListeners();
  }, [resetState, setupListeners, removeListeners]);

  // Auto-reconnect if disconnected
  useEffect(() => {
    if (!connected && socket) {
      reconnect();
    }
  }, [connected, socket, reconnect]);

  const handleCreateRoom = () => {
    console.log('[CreateRoom] Creating room, socket:', !!socket, 'connected:', connected);
    
    if (!socket) {
      setError('Socket not available. Please refresh the page.');
      return;
    }

    if (!connected) {
      setError('Not connected to server. Reconnecting...');
      reconnect();
      return;
    }

    setLoading(true);
    setError('');

    // Add timeout for slow responses
    const timeout = setTimeout(() => {
      console.log('[CreateRoom] Request timed out');
      setLoading(false);
      setError('Request timed out. Please try again.');
    }, 10000);

    // Use the store's createRoom action
    createRoom(settings, (response) => {
      console.log('[CreateRoom] Response:', response);
      clearTimeout(timeout);
      setLoading(false);
      
      if (response && response.success) {
        navigate(`/lobby/room/${response.room.roomCode}`);
      } else {
        setError(response?.message || 'Failed to create room');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col font-space">
      <div className="scanlines" />
      
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-4">
        {/* Header */}
        <header className="py-6 pt-10 flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="bg-white/5 p-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold text-white">Create Room</h1>
        </header>

        {/* Content */}
        <main className="flex-1 py-6">
          {/* Connection Status */}
          {!connected && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              Connecting to server...
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Format */}
            <div className="bg-[#1f2937] rounded-xl p-4 border border-slate-700">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider block mb-3">
                Match Format
              </label>
              <div className="flex gap-2">
                {[1, 3, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSettings({ ...settings, format: val })}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all
                      ${settings.format === val 
                        ? 'bg-primary text-black' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                  >
                    Best of {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Digits */}
            <div className="bg-[#1f2937] rounded-xl p-4 border border-slate-700">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider block mb-3">
                Number of Digits
              </label>
              <div className="flex gap-2">
                {[3, 4].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSettings({ ...settings, digits: val })}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all
                      ${settings.digits === val 
                        ? 'bg-primary text-black' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                  >
                    {val} Digits
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="bg-[#1f2937] rounded-xl p-4 border border-slate-700">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider block mb-3">
                Difficulty
              </label>
              <div className="flex gap-2">
                {['easy', 'hard'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSettings({ ...settings, difficulty: val })}
                    className={`flex-1 py-3 rounded-lg font-semibold capitalize transition-all
                      ${settings.difficulty === val 
                        ? 'bg-primary text-black' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6">
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98]
              ${loading 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-primary text-black shadow-neon hover:bg-yellow-400'
              }`}
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CreateRoomPage;
