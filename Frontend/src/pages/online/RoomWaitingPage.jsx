/**
 * RoomWaitingPage - Waiting room before game starts
 * 
 * Shows room info and waits for opponent to join.
 * When opponent joins, automatically navigates to game.
 */
import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import useOnlineGameStore from '../../store/useOnlineGameStore';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';
import InviteFriendModal from '../../components/lobby/InviteFriendModal';
import GameRulesModal from '../../components/game/GameRulesModal';

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
  const location = useLocation();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const inviteSentRef = useRef(false);

  const { socket, connected } = useSocket();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  
  // Check if we should auto-invite a friend
  const inviteFriend = location.state?.inviteFriend || null;
  
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
    if (status === 'SETUP' && countdown === null) {
      setCountdown(3);
    }
  }, [status, countdown]);

  // Set up online game store listeners on mount
  useEffect(() => {
    setupListeners();
    return () => removeListeners();
  }, [setupListeners, removeListeners]);

  // Auto-send invite if coming from profile page with inviteFriend
  useEffect(() => {
    // Skip if no friend to invite or already sent
    if (!inviteFriend || inviteSentRef.current) return;
    
    // Wait for socket and room to be ready
    if (!socket || !connected || !roomCode || !room) return;
    
    // Small delay to ensure socket is fully ready
    const timer = setTimeout(() => {
      if (inviteSentRef.current) return;
      
      socket.emit('send-game-invite', {
        friendId: inviteFriend._id,
        roomCode: roomCode,
      }, (response) => {
        if (response.success) {
          // Only mark as sent on success
          inviteSentRef.current = true;
          addToast(`Invite sent to ${inviteFriend.username}`, 'success');
        } else {
          addToast(response.message || 'Failed to send invite', 'error');
        }
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [socket, connected, roomCode, room, inviteFriend, addToast]);

  useEffect(() => {
    if (!socket || !roomCode) return;
    
    // Wait for socket to be connected
    if (!connected) {
      return;
    }

    // Always get room info first
    socket.emit('get-room', roomCode, (response) => {
      setLoading(false);
      if (response.success) {
        setRoom(response.room);
      } else {
        setError(response.message);
      }
    });

    // If not host, also try to join (in case we haven't joined yet)
    if (!storeIsHost) {
      socket.emit('join-room', roomCode, (response) => {
        if (response.success) {
          setRoom(response.room);
        }
        // If join fails, we already have room info from get-room above
      });
    }

    // Local event handlers for this component's UI
    const onPlayerJoined = (data) => {
      setRoom((prev) => ({
        ...prev,
        opponent: data.opponent,
      }));
    };

    const onPlayerLeft = () => {
      setRoom((prev) => ({
        ...prev,
        opponent: null,
      }));
    };

    const onRoomClosed = () => {
      // Host left - go back to home
      navigate('/home');
    };

    socket.on('player-joined', onPlayerJoined);
    socket.on('player-left', onPlayerLeft);
    socket.on('room-closed', onRoomClosed);

    return () => {
      socket.off('player-joined', onPlayerJoined);
      socket.off('player-left', onPlayerLeft);    socket.off('room-closed', onRoomClosed);    };
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
      <div className="min-h-screen bg-[#0d1520] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-700 border-t-cyan-400" />
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{'// Loading room...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1520] flex flex-col items-center justify-center p-4">
        <p className="text-red-400 font-mono text-sm mb-5">{error}</p>
        <button
          onClick={() => navigate('/home')}
          className="px-5 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs font-mono uppercase tracking-wider hover:bg-cyan-500/20 transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0d1520] flex flex-col font-space">
      <div className="scanlines" />

      {/* Ambient top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-4 min-h-0">

        {/* Header */}
        <header className="py-3 pt-5 flex items-center gap-3 shrink-0">
          <button
            onClick={handleLeaveRoom}
            className="bg-white/5 p-2 rounded-full hover:bg-white/10 transition-all text-slate-400 hover:text-white"
          >
            <BackIcon />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-black text-white uppercase tracking-[0.15em]">Game Lobby</h1>

          </div>
          {/* How to Play ? button */}
          <button
            onClick={() => setShowRules(true)}
            className="w-8 h-8 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all font-black text-sm font-mono"
            title="How to Play"
          >
            ?
          </button>
        </header>

        {/* Scrollable middle */}
        <div className="flex-1 overflow-y-auto min-h-0 px-1 pt-8" style={{scrollbarWidth:'none'}}>

        {/* Room Code */}
        <div className="tech-border text-center py-3 mb-3">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-1">Room Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-mono font-black text-cyan-400 tracking-[0.2em] drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
              {roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className={`p-2 rounded-lg border transition-all ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-white/5 border-slate-700/50 text-slate-500 hover:text-white hover:bg-white/10'
              }`}
            >
              <CopyIcon />
            </button>
          </div>
          {copied && (
            <p className="text-emerald-400 text-[10px] font-mono uppercase tracking-wider mt-1">✓ Copied to clipboard</p>
          )}
        </div>

        {/* Room Info Card */}
        <div className="relative rounded-xl bg-slate-800/40 border border-slate-700/50 overflow-hidden mb-3">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          {/* Settings row */}
          <div className="grid grid-cols-3 divide-x divide-slate-700/50 mb-0">
            <div className="py-2 text-center">
              <p className="text-lg font-black font-mono text-white">{room?.format || 1}</p>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-0.5">Format</p>
            </div>
            <div className="py-2 text-center">
              <p className="text-lg font-black font-mono text-white">{room?.digits || 4}</p>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-0.5">Digits</p>
            </div>
            <div className="py-2 text-center">
              <p className={`text-lg font-black font-mono capitalize ${room?.difficulty === 'hard' ? 'text-red-400' : 'text-emerald-400'}`}>
                {room?.difficulty || 'Easy'}
              </p>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-0.5">Difficulty</p>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-slate-700/50" />

          {/* Players */}
          <div className="p-2 space-y-1.5">
            {/* Host */}
            <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/30">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <span className="text-sm">👑</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0d1520] shadow-[0_0_6px_#34d399]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm truncate">{room?.host?.username || 'Host'}</p>
                <p className="text-[9px] font-mono text-yellow-500/70 uppercase tracking-wider">Host</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                Ready
              </span>
            </div>

            {/* Opponent */}
            <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/30">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
                {room?.opponent && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0d1520] shadow-[0_0_6px_#34d399]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {room?.opponent ? (
                  <>
                    <p className="text-white font-black text-sm truncate">{room.opponent.username}</p>
                    <p className="text-[9px] font-mono text-cyan-500/70 uppercase tracking-wider">Opponent</p>
                  </>
                ) : (
                  <p className="text-slate-500 text-sm font-mono">Waiting for opponent...</p>
                )}
              </div>
              {room?.opponent && (
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  Ready
                </span>
              )}
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600/40 to-transparent" />
        </div>

        {/* Waiting / Countdown status */}
        {countdown !== null ? (
          <div className="text-center py-6">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-2">Game Starting In</p>
            <div className="text-7xl font-black font-mono text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse">
              {countdown}
            </div>
          </div>
        ) : !room?.opponent ? (
          <div className="text-center py-2">
            <div className="flex justify-center gap-1.5 mb-2">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-3">
              Share the room code with your friend
            </p>
            {isHost && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-5 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs font-mono uppercase tracking-wider hover:bg-cyan-500/20 transition-all flex items-center gap-2 mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
                </svg>
                Invite Ally
              </button>
            )}
          </div>
        ) : countdown === null && (
          <div className="text-center py-3">
            <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              Both operatives ready
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </p>
          </div>
        )}

        </div>{/* end scrollable middle */}

        {/* Footer — fixed at bottom */}
        <footer className="shrink-0 py-3 space-y-2 border-t border-slate-700/30">

          {/* Match terminal panel — shown while waiting */}
          {!room?.opponent && countdown === null && (
            <div className="bg-black/50 border-l-2 border-cyan-500/50 px-3 py-2.5 rounded-r-lg font-mono text-[10px] mb-1">
              <div className="text-cyan-500/50 mb-1.5">{`> MATCH_CONFIG_LOADED...`}</div>
              <div className="space-y-1 text-slate-500">
                <p>
                  {`> MODE: `}
                  <span className={room?.difficulty === 'hard' ? 'text-red-400' : 'text-emerald-400'}>
                    {(room?.difficulty || 'easy').toUpperCase()}
                  </span>
                  <span className="text-slate-600">
                    {room?.difficulty === 'hard' ? ' (30s Timer + 5 Guess History)' : ' (No Timer + Full History)'}
                  </span>
                </p>
                <p>
                  {`> TARGET: `}
                  <span className="text-white">{room?.digits || 4}-DIGIT</span>
                  <span className="text-slate-600">{' CODE SEQUENCE'}</span>
                </p>
                <p>
                  {`> PROTOCOL: `}
                  <span className="text-white">
                    {room?.format === 1 ? 'SINGLE MATCH' : `BEST OF ${room?.format}`}
                  </span>
                  {room?.format > 1 && (
                    <span className="text-slate-600">{` (Race to ${Math.ceil(room.format / 2)} wins)`}</span>
                  )}
                </p>
                <p>
                  {`> STATUS: `}
                  <span className="text-yellow-400/80 animate-pulse">AWAITING SECOND OPERATIVE...</span>
                </p>
              </div>
              <div className="text-cyan-500/30 mt-1.5">{`> STANDBY_FOR_DEPLOYMENT...`}</div>
            </div>
          )}
          {isHost && room?.opponent && countdown === null && (
            <button
              onClick={handleStartGame}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-black text-sm uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all active:scale-[0.98]"
            >
              🎮 Deploy Match
            </button>
          )}
          {!isHost && room?.opponent && countdown === null && (
            <p className="text-center text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] animate-pulse py-2">
              {'// Awaiting host to initiate...'}
            </p>
          )}
          <button
            onClick={handleLeaveRoom}
            className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 font-bold text-xs font-mono uppercase tracking-wider border border-red-500/25 hover:bg-red-500/20 transition-all active:scale-[0.98]"
          >
            Leave Room
          </button>
        </footer>
      </div>

      {/* Invite Friend Modal */}
      {showInviteModal && (
        <InviteFriendModal
          onClose={() => setShowInviteModal(false)}
          roomCode={roomCode}
        />
      )}

      {/* How to Play Modal */}
      {showRules && (
        <GameRulesModal onClose={() => setShowRules(false)} />
      )}
    </div>
  );
};

export default RoomWaitingPage;
