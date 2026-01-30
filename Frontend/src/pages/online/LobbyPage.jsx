/**
 * LobbyPage - Waiting Room Before Game
 * 
 * Buffer screen showing:
 * - Room code (big, copyable)
 * - "Waiting for Player 2..." spinner
 * - Player avatars when P2 joins
 * - "Game Starting in 3..." countdown
 * - Auto-navigate to game when server says GO
 */
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useOnlineGameStore from '../../store/useOnlineGameStore';
import { Loader } from '../../components/ui';

// Icons
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
  </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
  </svg>
);

const UserIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-8 h-8 ${className}`}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const LobbyPage = () => {
  const { roomCode: urlRoomCode } = useParams();
  const navigate = useNavigate();
  
  const {
    roomCode,
    status,
    players,
    isHost,
    gameData,
    error,
    loading,
    joinRoom,
    leaveRoom,
    setupListeners,
    removeListeners,
    clearError,
  } = useOnlineGameStore();
  
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(null);
  
  // Join room if coming from URL
  useEffect(() => {
    if (urlRoomCode && !roomCode) {
      joinRoom(urlRoomCode);
    }
    
    setupListeners();
    
    return () => {
      removeListeners();
    };
  }, [urlRoomCode, roomCode, joinRoom, setupListeners, removeListeners]);
  
  // Handle opponent joining - start countdown
  useEffect(() => {
    if (players.opponent.connected && status === 'LOBBY') {
      setCountdown(3);
    }
  }, [players.opponent.connected, status]);
  
  // Countdown timer
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown === 0) {
      // Navigate to setup/game
      navigate(`/game/online/${roomCode}`);
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, navigate, roomCode]);
  
  // Navigate when game starts
  useEffect(() => {
    if (status === 'SETUP' || status === 'PLAYING') {
      navigate(`/game/online/${roomCode}`);
    }
  }, [status, navigate, roomCode]);
  
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(roomCode || urlRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomCode, urlRoomCode]);
  
  const handleLeave = useCallback(() => {
    leaveRoom(() => {
      navigate('/home');
    });
  }, [leaveRoom, navigate]);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <Loader text="Connecting..." />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl mb-6 text-center">
          {error}
        </div>
        <button
          onClick={() => {
            clearError();
            navigate('/home');
          }}
          className="bg-primary text-black px-6 py-3 rounded-lg font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }
  
  const displayCode = roomCode || urlRoomCode;
  const opponentJoined = players.opponent.connected;
  
  return (
    <div className="min-h-screen bg-[#111827] flex flex-col font-space overflow-hidden">
      <div className="scanlines pointer-events-none" />
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-4">
        {/* Header */}
        <header className="py-6 pt-10 flex items-center gap-4">
          <button
            onClick={handleLeave}
            className="bg-white/5 p-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold text-white tracking-wider uppercase">
            {isHost ? 'Your Room' : 'Joining Room'}
          </h1>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center py-6">
          {/* Room Code Display */}
          <div className="text-center mb-10">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-3 font-mono">
              ROOM CODE
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-slate-700">
                <span className="text-4xl sm:text-5xl font-mono font-bold text-primary tracking-[0.3em]">
                  {displayCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className={`
                  p-3 rounded-xl transition-all
                  ${copied 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                  }
                `}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-sm mt-2 animate-pulse">
                Copied to clipboard!
              </p>
            )}
          </div>
          
          {/* Game Config */}
          <div className="w-full bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 mb-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{gameData.format}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Best of</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{gameData.digits}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Digits</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white capitalize">{gameData.difficulty}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Mode</p>
              </div>
            </div>
          </div>
          
          {/* Player Status */}
          <div className="w-full space-y-4">
            {/* Host/Me */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-primary/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">
                    {players.me.name || 'You'}
                  </p>
                  <p className="text-xs text-slate-400">{isHost ? 'Host' : 'Player 2'}</p>
                </div>
                <div className="flex items-center gap-1.5 text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-mono">READY</span>
                </div>
              </div>
            </div>
            
            {/* Opponent */}
            <div className={`
              bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border transition-all duration-500
              ${opponentJoined ? 'border-blue-500/30' : 'border-slate-700/50'}
            `}>
              <div className="flex items-center gap-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${opponentJoined ? 'bg-blue-500/20' : 'bg-slate-700/50'}
                `}>
                  {opponentJoined ? (
                    <UserIcon className="text-blue-400" />
                  ) : (
                    <span className="text-2xl opacity-30">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  {opponentJoined ? (
                    <>
                      <p className="text-white font-semibold">
                        {players.opponent.name || 'Opponent'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isHost ? 'Player 2' : 'Host'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-500 font-semibold">
                        Waiting for opponent...
                      </p>
                      <p className="text-xs text-slate-600">
                        Share the room code
                      </p>
                    </>
                  )}
                </div>
                {opponentJoined ? (
                  <div className="flex items-center gap-1.5 text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-mono">JOINED</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Countdown */}
          {countdown !== null && (
            <div className="mt-10 text-center animate-pulse">
              <p className="text-primary text-2xl font-bold uppercase tracking-widest">
                Game Starting in {countdown}...
              </p>
            </div>
          )}
          
          {/* Waiting Message */}
          {!opponentJoined && (
            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-3 bg-slate-800/50 rounded-xl px-6 py-3 border border-slate-700/50">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm font-mono">
                  AWAITING OPPONENT CONNECTION...
                </p>
              </div>
            </div>
          )}
        </main>
        
        {/* Tech Border Footer */}
        <div className="mt-auto pt-4 pb-4 px-4 flex justify-between items-end opacity-20">
          <div className="h-12 w-12 border-l-2 border-b-2 border-white rounded-bl-xl" />
          <div className="font-mono text-[10px] text-center text-white">
            LOBBY ACTIVE<br/>AWAITING PLAYERS
          </div>
          <div className="h-12 w-12 border-r-2 border-b-2 border-white rounded-br-xl" />
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
