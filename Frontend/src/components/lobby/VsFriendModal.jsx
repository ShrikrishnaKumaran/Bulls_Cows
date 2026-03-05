/**
 * VsFriendModal - Online multiplayer room creation/joining modal
 * 
 * Allows users to:
 * - Create a new room and get a code
 * - Join an existing room by code
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useOnlineGameStore from '../../store/useOnlineGameStore';
import useAuthStore from '../../store/useAuthStore';

// Close Icon
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

// Crossed Swords Icon
const SwordsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
    <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
    <line x1="5" y1="14" x2="9" y2="18" />
    <line x1="7" y1="17" x2="4" y2="20" />
    <line x1="3" y1="19" x2="5" y2="21" />
  </svg>
);

// Create Room Icon
const CreateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Join Room Icon
const JoinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

function VsFriendModal({ onClose }) {
  const navigate = useNavigate();
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  
  const { joinRoom, setupListeners, removeListeners, resetState } = useOnlineGameStore();
  const { isAuthenticated } = useAuthStore();

  // Match ProtectedRoute logic — localStorage is the reliable source of truth
  const hasValidToken = () => {
    const t = localStorage.getItem('token');
    return isAuthenticated || (!!t && t !== 'undefined' && t !== 'null' && t.startsWith('eyJ'));
  };

  const handleGenerateCode = async () => {
    if (!hasValidToken()) {
      navigate('/auth');
      return;
    }

    // Navigate to online setup page to configure game settings
    onClose();
    navigate('/online/setup');
  };

  const handleJoinRoom = async () => {
    if (!hasValidToken()) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden rounded-2xl bg-[#0d1520] border border-slate-700/60 shadow-[0_0_60px_rgba(0,0,0,0.8)]">

          {/* Ambient top glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button onClick={onClose}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
            <CloseIcon />
          </button>

          {/* Header */}
          <div className="relative px-5 pt-5 pb-4 flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <SwordsIcon />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0d1520] shadow-[0_0_6px_#34d399]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.15em]">Online Duel</h2>
              <p className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-[0.2em] mt-0.5">
                {'// 1v1 Ranked Combat'}
              </p>
            </div>
          </div>

          {/* Scan-line divider */}
          <div className="mx-5 h-[1px] bg-gradient-to-r from-transparent via-slate-600/80 to-transparent mb-4" />

          {/* Content */}
          <div className="relative px-5 pb-5 space-y-3">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-3 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider text-center flex items-center justify-center gap-2">
                <span className="text-red-400">▲</span>
                {error}
              </div>
            )}

            {/* ── CREATE ROOM ── */}
            <div className="relative group rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 overflow-hidden">
              {/* Side accent */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/80 via-cyan-400/40 to-transparent rounded-l-xl" />
              <div className="px-4 pt-3.5 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] font-black font-mono text-cyan-500/70 uppercase tracking-[0.3em]">Initialize Room</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent" />
                </div>
                <button
                  onClick={handleGenerateCode}
                  className="w-full py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-200
                    bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300
                    text-black flex items-center justify-center gap-2 font-mono
                    shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]
                    active:scale-[0.98]"
                >
                  <CreateIcon />
                  <span>Create Room</span>
                </button>
              </div>
            </div>

            {/* ── OR separator ── */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[9px] font-black font-mono text-slate-600 uppercase tracking-[0.4em] px-1">OR</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* ── JOIN ROOM ── */}
            <div className="relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 overflow-hidden">
              {/* Side accent */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-500/80 via-yellow-400/40 to-transparent rounded-l-xl" />
              <div className="px-4 pt-3.5 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] font-black font-mono text-yellow-500/70 uppercase tracking-[0.3em]">Join Room</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/20 to-transparent" />
                </div>

                {/* 4-box code input */}
                <div
                  className="relative flex gap-2 justify-center mb-3 cursor-text"
                  onClick={() => inputRef.current?.focus()}
                >
                  {/* Hidden real input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => {
                      setJoinCodeInput(e.target.value.toUpperCase());
                      setError('');
                    }}
                    maxLength={4}
                    autoComplete="off"
                    className="absolute inset-0 opacity-0 w-full h-full cursor-text z-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                  {/* Visual character cells */}
                  {[0, 1, 2, 3].map((i) => {
                    const char = joinCodeInput[i];
                    const isActive = i === joinCodeInput.length;
                    const isFilled = i < joinCodeInput.length;
                    return (
                      <div
                        key={i}
                        className={`relative w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black font-mono transition-all duration-200
                          ${isFilled
                            ? 'bg-cyan-500/10 border-2 border-cyan-500/60 text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.15)]'
                            : isActive
                            ? 'bg-slate-800 border-2 border-cyan-500/40 text-slate-600 shadow-[0_0_8px_rgba(6,182,212,0.08)]'
                            : 'bg-slate-900/60 border-2 border-slate-700/50 text-slate-700'
                          }`}
                      >
                        {char || (isActive ? (
                          <span className="caret-blink text-cyan-400 text-xl font-light select-none">|</span>
                        ) : (
                          <span className="text-slate-700 text-xs">·</span>
                        ))}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={joinCodeInput.length < 4 || joining}
                  className={`w-full py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-200 font-mono flex items-center justify-center gap-2 active:scale-[0.98]
                    ${joinCodeInput.length < 4 || joining
                      ? 'bg-slate-800/60 text-slate-600 cursor-not-allowed border border-slate-700/40'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black shadow-[0_0_20px_rgba(234,179,8,0.25)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]'
                    }`}
                >
                  {joining ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black/30 border-t-black" />
                  ) : (
                    <>
                      <JoinIcon />
                      <span>Join Room</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom glow line */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default VsFriendModal;
