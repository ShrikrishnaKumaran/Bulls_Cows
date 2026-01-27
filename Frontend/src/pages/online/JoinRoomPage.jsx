/**
 * JoinRoomPage - Join an existing game room by code
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';

// Back Icon
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
  </svg>
);

const JoinRoomPage = () => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (!roomCode || roomCode.length !== 4) {
      setError('Please enter a valid 4-character room code');
      return;
    }

    if (!socket) {
      setError('Socket connection not available');
      return;
    }

    setLoading(true);
    setError('');

    socket.emit('join-room', roomCode.toUpperCase(), (response) => {
      setLoading(false);
      if (response.success) {
        navigate(`/lobby/room/${roomCode.toUpperCase()}`);
      } else {
        setError(response.message);
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
          <h1 className="text-xl font-bold text-white">Join Room</h1>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col justify-center py-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="bg-[#1f2937] rounded-xl p-6 border border-slate-700">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider block mb-4 text-center">
              Enter Room Code
            </label>
            <input
              type="text"
              placeholder="XXXX"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase());
                setError('');
              }}
              maxLength={4}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg py-4 px-4 text-white text-center text-3xl font-mono tracking-[0.5em] uppercase placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            />
            <button
              onClick={handleJoinRoom}
              disabled={loading || !roomCode}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98]
                ${loading || !roomCode
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-primary text-black shadow-neon hover:bg-yellow-400'
                }`}
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JoinRoomPage;
