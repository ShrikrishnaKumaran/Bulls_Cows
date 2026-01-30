/**
 * RoomWaitingPage - Waiting room before game starts
 * 
 * Shows room info and waits for opponent to join.
 * When opponent joins, automatically navigates to game.
 */
import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import useOnlineGameStore from '../../store/useOnlineGameStore';
import useAuthStore from '../../store/useAuthStore';

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
  const [countdown, setCountdown] = useState(null);

  const { socket, connected } = useSocket();
  const navigate = useNavigate();
  
  // Get current user from auth store
  const { user } = useAuthStore();
  
  // Use online game store to setup listeners and check status
  const { setupListeners, removeListeners, isHost: storeIsHost, status } = useOnlineGameStore();
  
  // Determine if current user is host - check both store and room data
  const isHost = useMemo(() => {
    // First check the store value
    if (storeIsHost) return true;
    
    // Then check room data against current user
    if (room && user) {
      const hostId = room.host?._id || room.host;
      return hostId === user._id || hostId === user.id;
    }
    
    return false;
  }, [storeIsHost, room, user]);

  // Countdown effect - navigates to game when countdown reaches 0
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown === 0) {
      console.log('[RoomWaiting] Countdown done, navigating to game');
      navigate(`/game/online/${roomCode}`);
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, navigate, roomCode]);

  // Watch store status - when it changes to SETUP, start countdown
  useEffect(() => {
    console.log('[RoomWaiting] Status changed:', status, 'countdown:', countdown);
    if (status === 'SETUP' && countdown === null) {
      console.log('[RoomWaiting] Status is SETUP, starting countdown');
      setCountdown(3);
    }
  }, [status, countdown]);

  // Set up online game store listeners on mount
  useEffect(() => {
    setupListeners();
    return () => removeListeners();
  }, [setupListeners, removeListeners]);

  useEffect(() => {
    if (!socket || !roomCode) return;
    
    // Wait for socket to be connected
    if (!connected) {
      console.log('[RoomWaiting] Waiting for socket connection...');
      return;
    }

    console.log('[RoomWaiting] Socket connected, isHost:', isHost, 'storeIsHost:', storeIsHost, 'getting room:', roomCode);

    // Always get room info first
    socket.emit('get-room', roomCode, (response) => {
      setLoading(false);
      console.log('[RoomWaiting] Get room response:', response);
      if (response.success) {
        setRoom(response.room);
      } else {
        setError(response.message);
      }
    });

    // If not host, also try to join (in case we haven't joined yet)
    if (!storeIsHost) {
      socket.emit('join-room', roomCode, (response) => {
        console.log('[RoomWaiting] Join room response:', response);
        if (response.success) {
          setRoom(response.room);
        }
        // If join fails, we already have room info from get-room above
      });
    }

    // Local event handlers for this component's UI
    const onPlayerJoined = (data) => {
      console.log('[RoomWaiting] Player joined:', data);
      setRoom((prev) => ({
        ...prev,
        opponent: data.opponent,
      }));
    };

    const onPlayerLeft = () => {
      console.log('[RoomWaiting] Player left');
      setRoom((prev) => ({
        ...prev,
        opponent: null,
      }));
    };

    socket.on('player-joined', onPlayerJoined);
    socket.on('player-left', onPlayerLeft);

    return () => {
      socket.off('player-joined', onPlayerJoined);
      socket.off('player-left', onPlayerLeft);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomCode, connected, storeIsHost]);

  const handleLeaveRoom = () => {
    if (socket && roomCode) {
      socket.emit('leave-room', roomCode, (response) => {
        if (response.success) {
          navigate('/home');
        }
      });
    } else {
      navigate('/home');
    }
  };

  const handleStartGame = () => {
    if (socket && roomCode && room?.opponent) {
      console.log('[RoomWaiting] Starting game...');
      socket.emit('start-game', roomCode, (response) => {
        if (!response.success) {
          console.error('[RoomWaiting] Failed to start game:', response.message);
        }
        // The game-start event will trigger navigation
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

          {/* Waiting Animation / Countdown */}
          {countdown !== null ? (
            <div className="text-center py-8">
              <div className="text-6xl font-bold text-primary mb-4 animate-pulse">
                {countdown}
              </div>
              <p className="text-white text-lg uppercase tracking-widest">
                Game Starting...
              </p>
            </div>
          ) : !room?.opponent ? (
            <div className="text-center">
              <div className="flex justify-center gap-1 mb-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-slate-400 text-sm">Share the room code with your friend</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-green-400 text-sm">
                ✓ Both players ready!
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-6 space-y-3">
          {/* Start Game Button - Only show to host when opponent has joined */}
          {isHost && room?.opponent && countdown === null && (
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-xl bg-primary text-black font-bold text-lg shadow-neon hover:bg-yellow-400 transition-all active:scale-[0.98]"
            >
              🎮 Start Game
            </button>
          )}
          
          {/* Waiting message for non-host */}
          {!isHost && room?.opponent && countdown === null && (
            <div className="text-center py-3">
              <p className="text-slate-400 text-sm animate-pulse">
                Waiting for host to start the game...
              </p>
            </div>
          )}
          
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
