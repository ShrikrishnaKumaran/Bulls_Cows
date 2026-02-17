/**
 * VsFriendModal - Online multiplayer room creation/joining modal
 * 
 * Allows users to:
 * - Create a new room and get a code
 * - Join an existing room by code
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOnlineGameStore from '../../store/useOnlineGameStore';

// Close Icon
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

function VsFriendModal({ onClose }) {
  const navigate = useNavigate();
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  
  const { joinRoom, setupListeners, removeListeners, resetState } = useOnlineGameStore();

  const handleGenerateCode = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to create a room');
      navigate('/auth');
      return;
    }

    // Navigate to online setup page to configure game settings
    onClose();
    navigate('/online/setup');
  };

  const handleJoinRoom = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to join a room');
      navigate('/auth');
      return;
    }

    if (!joinCodeInput.trim() || joinCodeInput.length !== 4) {
      setError('Please enter a valid 4-character room code');
      return;
    }

    setJoining(true);
    setError('');
    
    // Reset state and setup listeners before joining
    resetState();
    setupListeners();

    // Use socket-based join via the store
    joinRoom(joinCodeInput.toUpperCase(), (response) => {
      setJoining(false);
      if (response.success) {
        onClose();
        navigate(`/lobby/room/${joinCodeInput.toUpperCase()}`);
      } else {
        setError(response.message || 'Failed to join room');
        removeListeners();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Modal Card */}
      <div className="bg-[#1f2937] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white tracking-wide">
            ONLINE DUEL
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>



        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

              {/* Create Room Section */}
              <div className="bg-[#111827] rounded-xl p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
                  Create Room
                </h3>
                <button
                  onClick={handleGenerateCode}
                  className="w-full py-3 rounded-lg font-semibold transition-all bg-primary text-black hover:bg-yellow-400"
                >
                  ➕ Create Room
                </button>
              </div>

              {/* Join Room Section */}
              <div className="bg-[#111827] rounded-xl p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
                  Join Room
                </h3>
                <input
                  type="text"
                  placeholder="Enter Room Code"
                  value={joinCodeInput}
                  onChange={(e) => {
                    setJoinCodeInput(e.target.value.toUpperCase());
                    setError('');
                  }}
                  maxLength={4}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg py-3 px-4 text-white text-center text-xl font-mono tracking-widest uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!joinCodeInput.trim() || joining}
                  className={`w-full py-3 rounded-lg font-semibold transition-all
                    ${!joinCodeInput.trim() || joining
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                    }`}
                >
                  {joining ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default VsFriendModal;
