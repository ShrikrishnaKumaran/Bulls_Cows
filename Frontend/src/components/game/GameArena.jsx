/**
 * GameArena - Master Game Arena UI
 * 
 * A cyber-themed game board matching the reference design with:
 * - Player cards with attempt counts
 * - Emoji-based result icons (🎯 Bull, 🐄 Cow, 💩 Miss)
 * - Move history feed
 * - Bottom input drawer with Drum Picker
 */
import { useState, useRef, useEffect } from 'react';
import HoloSphereInput from '../ui/HoloSphereInput';

// ═══════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════

const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
  </svg>
);

const TimerIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
  </svg>
);


const TrophyIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.937 6.937 0 006.215 6.215.75.75 0 00.859-.584c.213-1.012.395-2.036.543-3.071h.858c.148 1.035.33 2.059.543 3.071a.75.75 0 00.859.584 6.937 6.937 0 006.215-6.215.75.75 0 00-.584-.859c-1.012-.213-2.036-.395-3.071-.543v-.858a.75.75 0 00-.75-.75H5.916a.75.75 0 00-.75.75zm11.334 5.379c0 2.9-2.35 5.25-5.25 5.25S6 10.9 6 8V3.75h10.5V8z" clipRule="evenodd" />
    <path d="M6.75 18.75a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zM8.25 21a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z" />
  </svg>
);

// Vector Icons for Results (Professional Look)
const TargetIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// MATCH INFO PILL
// ═══════════════════════════════════════════════════════════

const MatchInfoPill = ({ score, format, difficulty }) => (
  <div className="flex justify-center mb-4">
    <div className="bg-[#1f2937] border border-white/10 rounded-full px-4 py-2 text-xs font-bold tracking-wider text-slate-300 flex items-center gap-2">
      <span>MATCH: {score}</span>
      <span className="text-slate-500">|</span>
      <span>{format}</span>
      <span className="text-slate-500">|</span>
      <span className="text-primary">{difficulty.toUpperCase()}</span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// PLAYER CARD (P1=Yellow, P2=Blue when active)
// ═══════════════════════════════════════════════════════════

const PlayerCard = ({ name, isMe, isActive, attempts }) => {
  const Icon = isMe ? UserIcon : UsersIcon;
  
  // Player 1 (isMe) = Yellow, Player 2 (!isMe) = Blue
  const activeColor = isMe ? 'border-primary shadow-[0_0_20px_rgba(250,204,20,0.4)]' : 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]';
  const accentBg = isMe ? 'bg-primary/20' : 'bg-blue-500/20';
  const accentText = isMe ? 'text-primary' : 'text-blue-400';
  const turnBadgeBg = isMe ? 'bg-primary text-black' : 'bg-blue-500 text-white';
  
  return (
    <div 
      className={`
        relative flex-1 bg-[#1f2937] rounded-2xl p-4 border-2 transition-all duration-300
        ${isActive 
          ? activeColor 
          : 'border-slate-700/50 opacity-70'
        }
      `}
    >
      {/* TURN Badge */}
      {isActive && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${turnBadgeBg} text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider`}>
          Turn
        </div>
      )}
      
      {/* Card Content */}
      <div className="flex items-start justify-between">
        {/* Left: Icon + Name + Attempts */}
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${isActive ? accentBg + ' ' + accentText : 'bg-slate-700 text-slate-400'}
          `}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-base ${isActive ? 'text-white' : 'text-slate-400'}`}>
              {name}
            </h3>
            <p className="text-xs text-slate-500">
              Att: <span className={isActive ? accentText : 'text-slate-400'}>{attempts}</span>
            </p>
          </div>
        </div>
        
        {/* Right: Badge */}
        <span className={`
          text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
          ${isMe 
            ? 'bg-primary/20 text-primary' 
            : 'bg-blue-500/20 text-blue-400'
          }
        `}>
          {isMe ? 'P1' : 'P2'}
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// TIMER BAR
// ═══════════════════════════════════════════════════════════

const TimerBar = ({ timer, maxTime = 30 }) => {
  const percentage = (timer / maxTime) * 100;
  
  return (
    <div className="mb-6">
      {/* Labels */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm font-medium">TIME REMAINING</span>
        <div className="flex items-center gap-1">
          <TimerIcon className={`w-4 h-4 ${timer <= 10 ? 'text-red-400' : 'text-primary'}`} />
          <span className={`font-mono font-bold ${timer <= 10 ? 'text-red-400' : 'text-white'}`}>
            {timer.toFixed(1)}s
          </span>
          <span className="text-slate-500 text-sm">/ {maxTime}.0s</span>
        </div>
      </div>
      
      {/* Bar */}
      <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-orange-500 transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// LOG CARD (Chat Bubble Style with Vector Icons)
// ═══════════════════════════════════════════════════════════

const LogCard = ({ log, digits, turnNumber }) => {
  // Player 1 guesses appear on LEFT, Player 2 guesses appear on RIGHT
  // 'me' = Player 1 (left card) = left side logs
  // 'opponent' = Player 2 (right card) = right side logs
  const isPlayer1 = log.player === 'me';
  const guessDigits = log.guess.split('');
  const misses = digits - log.bulls - log.cows;
  
  // Generate result emojis: 🐂 Bull, 🐮 Cow, ❌ Miss
  const resultEmojis = [];
  for (let i = 0; i < log.bulls; i++) resultEmojis.push('🐂');
  for (let i = 0; i < log.cows; i++) resultEmojis.push('🐮');
  for (let i = 0; i < misses; i++) resultEmojis.push('❌');
  
  return (
    <div 
      className={`
        w-[85%] relative
        ${isPlayer1 ? 'mr-auto' : 'ml-auto'}
      `}
    >
      {/* Turn Number Badge */}
      {turnNumber && (
        <span 
          className={`
            absolute -top-1 text-[10px] font-mono text-slate-500
            ${isPlayer1 ? 'left-2' : 'right-2'}
          `}
        >
          #{String(turnNumber).padStart(2, '0')}
        </span>
      )}
      
      {/* Chat Bubble Card */}
      <div 
        className={`
          p-3 mt-2 transition-all
          ${isPlayer1 
            ? 'bg-primary/5 border-l-2 border-primary rounded-r-xl rounded-tl-xl' 
            : 'bg-blue-500/5 border-r-2 border-blue-500 rounded-l-xl rounded-tr-xl'
          }
        `}
      >
        {/* Row 1: Guess Digits (Hero) */}
        <div 
          className={`
            flex items-center mb-2
            ${isPlayer1 ? 'justify-start' : 'justify-end'}
          `}
        >
          <div className="flex" style={{ gap: '0.5em', letterSpacing: '0.15em' }}>
            {guessDigits.map((digit, i) => (
              <span 
                key={i} 
                className="text-xl font-bold font-mono text-white"
              >
                {digit}
              </span>
            ))}
          </div>
        </div>
        
        {/* Row 2: Result Emojis */}
        <div 
          className={`
            flex items-center
            ${isPlayer1 ? 'justify-start' : 'justify-end'}
          `}
        >
          {/* Emoji Icons */}
          <div className="flex items-center" style={{ gap: '0.25em' }}>
            {resultEmojis.map((emoji, i) => (
              <span key={i} className="text-lg">{emoji}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// INPUT DRAWER (Bottom) - With Frosted Glass Effect
// ═══════════════════════════════════════════════════════════

const InputDrawer = ({ value, digits, onChange, onSubmit, disabled }) => {
  return (
    <div 
      className="bg-[#0d1117]/90 backdrop-blur-xl border-t border-white/10 rounded-t-xl flex flex-col"
      style={{ padding: '2% 4%' }}
    >
      {/* Holo-Sphere Input */}
      <div style={{ marginBottom: '2%' }}>
        <HoloSphereInput
          length={digits}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      
      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={disabled}
        className={`
          w-full rounded-full font-bold
          flex items-center justify-center transition-all active:scale-[0.98]
          ${disabled
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-primary hover:bg-yellow-400 text-black shadow-neon'
          }
        `}
        style={{ padding: '2% 0', fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', gap: '2%' }}
      >
        Submit Guess <span style={{ fontSize: 'clamp(0.875rem, 3.5vw, 1rem)' }}>🎯</span>
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN GAME ARENA COMPONENT
// ═══════════════════════════════════════════════════════════

function GameArena({
  turn = 'me', // 'me' | 'opponent'
  difficulty = 'Easy',
  config = { format: 'Single', score: '0-0' },
  logs = [],
  onGuess,
  timer = 30,
  maxTime = 30,
  digits = 4,
  isGameOver = false,
  winner = null,
  myName = 'PLAYER 1',
  opponentName = 'PLAYER 2',
  myAttempts = 0,
  opponentAttempts = 0,
  onPlayAgain,
  onQuit
}) {
  const [currentGuess, setCurrentGuess] = useState('0'.repeat(digits));
  const [error, setError] = useState('');
  const logsEndRef = useRef(null);
  
  // Reset guess when turn changes
  useEffect(() => {
    setCurrentGuess('0'.repeat(digits));
    setError('');
  }, [turn, digits]);
  
  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);
  
  const isHardMode = difficulty === 'Hard';
  const isMyTurn = turn === 'me';
  
  const handleGuessChange = (newGuess) => {
    setCurrentGuess(newGuess);
    setError('');
  };
  
  const handleSubmit = () => {
    // Check for duplicate digits
    const digitSet = new Set(currentGuess.split(''));
    if (digitSet.size !== digits) {
      setError('All digits must be unique!');
      return;
    }
    
    onGuess(currentGuess);
    setCurrentGuess('0'.repeat(digits));
    setError('');
  };
  
  // ─── GAME OVER SCREEN ───
  if (isGameOver) {
    const winnerIsMe = winner === 'me' || winner === 'PLAYER_1';
    const winnerName = winnerIsMe ? myName : opponentName;
    
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col font-space">
        <div className="scanlines" />
        
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4">
          {/* Trophy */}
          <div className="text-primary mb-6 animate-bounce">
            <TrophyIcon className="w-24 h-24" />
          </div>
          
          {/* Winner Text */}
          <h2 className="text-3xl font-bold text-white text-center mb-2 glitch-text">
            {winnerName} WINS!
          </h2>
          <p className="text-slate-400 text-center mb-8">
            🎉 {winnerIsMe ? 'Congratulations!' : 'Better luck next time!'}
          </p>
          
          {/* Stats */}
          <div className="w-full bg-[#1f2937] rounded-xl p-4 border border-slate-700 mb-8">
            <div className="text-center text-slate-400 text-sm mb-2">Final Score</div>
            <div className="text-center text-2xl font-bold text-white font-mono">
              {config.score}
            </div>
          </div>
          
          {/* Actions */}
          <div className="w-full space-y-3">
            <button
              onClick={onPlayAgain}
              className="w-full py-4 rounded-full bg-primary text-black font-bold text-lg shadow-neon hover:bg-yellow-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              🔄 Play Again
            </button>
            <button
              onClick={onQuit}
              className="w-full py-3 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700 hover:bg-slate-700 transition-all active:scale-[0.98]"
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // ─── MAIN GAME UI ───
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col font-space">
      <div className="scanlines" />
      
      <div className="relative z-10 h-screen flex flex-col w-full max-w-lg mx-auto">
        
        {/* ═══ FIXED HEADER ═══ */}
        <div className="flex-shrink-0 px-3 sm:px-4 pt-2 sm:pt-4 pb-2 sm:pb-3 bg-[#0d1117]">
          {/* 1. Match Info Pill */}
          <MatchInfoPill 
            score={config.score} 
            format={config.format} 
            difficulty={difficulty} 
          />
          
          {/* 2. Player Cards */}
          <div className="flex gap-2 sm:gap-3 mb-2 sm:mb-3">
            <PlayerCard 
              name={myName}
              isMe={true}
              isActive={isMyTurn}
              attempts={myAttempts}
            />
            <PlayerCard 
              name={opponentName}
              isMe={false}
              isActive={!isMyTurn}
              attempts={opponentAttempts}
            />
          </div>
          
          {/* 3. Timer (Hard Mode Only) */}
          {isHardMode && (
            <TimerBar timer={timer} maxTime={maxTime} />
          )}
        </div>
        
        {/* ═══ SCROLLABLE MOVE HISTORY ═══ */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 scrollbar-hide min-h-0">
          {/* Move History List */}
          <div className="space-y-3 pb-2 pt-2">
            {logs.length === 0 ? (
              <div className="text-center py-4 sm:py-6 text-slate-500 text-sm">
                No moves yet. Make the first guess!
              </div>
            ) : (
              logs.map((log, index) => (
                <LogCard key={index} log={log} digits={digits} turnNumber={index + 1} />
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
        
        {/* ═══ FIXED INPUT DRAWER (Bottom) ═══ */}
        <div className="flex-shrink-0">
          {error && (
            <p className="text-red-400 text-sm text-center px-3 sm:px-4 pb-2">{error}</p>
          )}
          
          <InputDrawer
            value={currentGuess}
            digits={digits}
            onChange={handleGuessChange}
            onSubmit={handleSubmit}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
}

export default GameArena;
