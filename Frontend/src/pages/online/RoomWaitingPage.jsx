/**
 * RoomWaitingPage - Waiting room before game starts
 * 
 * Shows room info and waits for opponent to join.
 * When opponent joins, automatically navigates to game.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import useGameStore from '../../store/useGameStore';

// Back Icon
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
  </svg>
);

// Copy Icon
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375z" clipRule="evenodd" />
  </svg>
);

const RoomWaitingPage = () => {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const { socket } = useSocket();
  const navigate = useNavigate();
  const initializeGame = useGameStore((state) => state.initializeGame);

  useEffect(() => {
    if (!socket || !roomCode) return;

    socket.emit('join-room', roomCode, (response) => {
      setLoading(false);
      if (response.success) {
        setRoom(response.room);
      } else {
        socket.emit('get-room', roomCode, (getResponse) => {
          if (getResponse.success) {
            setRoom(getResponse.room);
          } else {
            setError(getResponse.message || response.message);
          }
        });
      }
    });

    socket.on('player-joined', (data) => {
      setRoom((prev) => ({
        ...prev,
        opponent: data.opponent,
      }));
    });

    socket.on('player-left', () => {
      setRoom((prev) => ({
        ...prev,
        opponent: null,
      }));
    });

    socket.on('game-start', (data) => {
      initializeGame(data.roomCode, {
        format: data.format,
        digits: data.digits,
        hostId: data.host?._id || data.host,
        opponentId: data.opponent?._id || data.opponent,
        roundNumber: 1,
        scores: {},
      });
      
      navigate(`/game/online/${data.roomCode}`);
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-start');
    };
  }, [socket, roomCode, navigate, initializeGame]);

  const handleLeaveRoom = () => {
    if (socket && roomCode) {
      socket.emit('leave-room', roomCode, (response) => {
        if (response.success) {
          navigate('/home');
        }
      });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center p-4">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={() => navigate('/home')}
          className="bg-primary text-black px-6 py-3 rounded-lg font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col font-space">
      <div className="scanlines" />
      
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-4">
        {/* Header */}
        <header className="py-6 pt-10 flex items-center gap-4">
          <button
            onClick={handleLeaveRoom}
            className="bg-white/5 p-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold text-white">Waiting Room</h1>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col items-center justify-center py-6">
          {/* Room Code */}
          <div className="text-center mb-8">
            <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Room Code</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-mono font-bold text-primary tracking-widest">
                {roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-all text-slate-400 hover:text-white"
              >
                <CopyIcon />
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-sm mt-2">Copied!</p>
            )}
          </div>

          {/* Room Info */}
          <div className="w-full bg-[#1f2937] rounded-xl p-6 border border-slate-700 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <p className="text-2xl font-bold text-white">{room?.format || 3}</p>
                <p className="text-xs text-slate-400 uppercase">Format</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{room?.digits || 4}</p>
                <p className="text-xs text-slate-400 uppercase">Digits</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white capitalize">{room?.difficulty || 'easy'}</p>
                <p className="text-xs text-slate-400 uppercase">Difficulty</p>
              </div>
            </div>

            {/* Players */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary">👑</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{room?.host?.username || 'Host'}</p>
                  <p className="text-xs text-slate-400">Host</p>
                </div>
                <span className="text-green-400 text-xs">● Ready</span>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400">👤</span>
                </div>
                <div className="flex-1">
                  {room?.opponent ? (
                    <>
                      <p className="text-white font-semibold">{room.opponent.username}</p>
                      <p className="text-xs text-slate-400">Opponent</p>
                    </>
                  ) : (
                    <p className="text-slate-400">Waiting for opponent...</p>
                  )}
                </div>
                {room?.opponent && (
                  <span className="text-green-400 text-xs">● Ready</span>
                )}
              </div>
            </div>
          </div>

          {/* Waiting Animation */}
          {!room?.opponent && (
            <div className="text-center">
              <div className="flex justify-center gap-1 mb-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-slate-400 text-sm">Share the room code with your friend</p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-6">
          <button
            onClick={handleLeaveRoom}
            className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold border border-red-500/30 hover:bg-red-500/30 transition-all"
          >
            Leave Room
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RoomWaitingPage;
