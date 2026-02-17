/**
 * OnlineGamePage - Online 1v1 Game Container
 * 
 * Connects the GameArena to the Online (1v1) store.
 * Handles:
 * - SETUP phase: Secret entry with reused SecretEntryStep UI
 * - PLAYING phase: GameArena with real-time updates
 * - GAME_OVER phase: Victory/defeat screen
 * - Disconnect handling
 */
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useOnlineGameStore from '../../store/useOnlineGameStore';
import useAuthStore from '../../store/useAuthStore';
import { GameArena } from '../../components/game';
import { SecretEntryStep } from '../../components/setup';
import { Loader } from '../../components/ui';
import { HARD_MODE_HISTORY_LIMIT } from '../../utils/constants';

const OnlineGamePage = () => {
  const { roomCode: urlRoomCode } = useParams();
  const navigate = useNavigate();
  
  const { user } = useAuthStore();
  
  const {
    roomCode,
    status,
    players,
    gameData,
    winner,
    winnerName,
    gameOverReason,
    roundWinner,
    roundWinnerName,
    roomClosedMessage,
    error,
    loading,
    joinRoom,
    leaveRoom,
    setSecret,
    sendGuess,
    setupListeners,
    removeListeners,
    resetState,
    requestGameState,
  } = useOnlineGameStore();
  
  // Local state for secret entry
  const [secretInput, setSecretInput] = useState('');
  const [secretError, setSecretError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize on mount
  useEffect(() => {
    // Set up listeners
    setupListeners();
    
    // If we have no room code in store but have URL param, and status is IDLE,
    // we might have refreshed the page or navigated directly - try to rejoin
    if (urlRoomCode && !roomCode && status === 'IDLE') {
      joinRoom(urlRoomCode, (response) => {
        if (response.success) {
          requestGameState();
        }
      });
    }
    
    return () => {
      removeListeners();
    };
  }, [urlRoomCode, roomCode, status, joinRoom, setupListeners, removeListeners, requestGameState]);
  
  // Compute derived state
  const isMyTurn = gameData.turn === 'me';
  const myName = players.me.name || user?.username || 'You';
  const opponentName = players.opponent.name || 'Opponent';
  
  // Combine logs for GameArena (chronological order by guessNumber)
  // In Hard mode, only show last 5 guesses per player (FIFO queue)
  const combinedLogs = useMemo(() => {
    const isHardMode = gameData.difficulty === 'hard';
    
    // Apply FIFO limit in Hard mode - only show last N guesses
    const limitedMyLogs = isHardMode 
      ? gameData.myLogs.slice(-HARD_MODE_HISTORY_LIMIT) 
      : gameData.myLogs;
    const limitedOppLogs = isHardMode 
      ? gameData.opponentLogs.slice(-HARD_MODE_HISTORY_LIMIT) 
      : gameData.opponentLogs;
    
    const myLogs = limitedMyLogs.map(log => ({ ...log, player: 'me' }));
    const oppLogs = limitedOppLogs.map(log => ({ ...log, player: 'opponent' }));
    return [...myLogs, ...oppLogs].sort((a, b) => 
      (a.guessNumber || 0) - (b.guessNumber || 0)
    );
  }, [gameData.myLogs, gameData.opponentLogs, gameData.difficulty]);
  
  // ─── HANDLERS ───
  
  const handleSecretChange = useCallback((value) => {
    setSecretInput(value);
    setSecretError('');
  }, []);
  
  const handleSecretSubmit = useCallback(() => {
    // Validate
    if (secretInput.length !== gameData.digits) {
      setSecretError(`Secret must be exactly ${gameData.digits} digits`);
      return;
    }
    
    const uniqueDigits = new Set(secretInput.split(''));
    if (uniqueDigits.size !== gameData.digits) {
      setSecretError('All digits must be unique');
      return;
    }
    
    setIsSubmitting(true);
    setSecret(secretInput, (response) => {
      setIsSubmitting(false);
      if (!response.success) {
        setSecretError(response.message);
      }
    });
  }, [secretInput, gameData.digits, setSecret]);
  
  const handleGuess = useCallback((guess) => {
    sendGuess(guess, (response) => {
      if (!response.success) {
        console.error('Guess failed:', response.message);
      }
    });
  }, [sendGuess]);
  
  const handlePlayAgain = useCallback(() => {
    resetState();
    navigate('/home');
  }, [resetState, navigate]);
  
  const handleQuit = useCallback(() => {
    leaveRoom(() => {
      resetState();
      navigate('/home');
    });
  }, [leaveRoom, resetState, navigate]);
  
  const handleBack = useCallback(() => {
    leaveRoom(() => {
      resetState();
      navigate('/home');
    });
  }, [leaveRoom, resetState, navigate]);
  
  // ─── LOADING STATE ───
  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <Loader text="Connecting to game..." />
      </div>
    );
  }
  
  // ─── ERROR STATE ───
  if (error) {
    return (
      <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl mb-6 text-center">
          {error}
        </div>
        <button
          onClick={() => {
            resetState();
            navigate('/home');
          }}
          className="bg-primary text-black px-6 py-3 rounded-lg font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }
  
  // ─── ROOM CLOSED (host left) ───
  if (status === 'ROOM_CLOSED') {
    return (
      <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center p-4">
        <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-6 py-4 rounded-xl mb-6 text-center max-w-sm">
          <p className="text-lg font-semibold mb-2">Room Closed</p>
          <p className="text-sm">{roomClosedMessage || 'Host has left the room'}</p>
        </div>
        <button
          onClick={() => {
            resetState();
            navigate('/home');
          }}
          className="bg-primary text-black px-6 py-3 rounded-lg font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }
  
  // ─── ROUND OVER PHASE ─── (shows round winner before next round)
  if (status === 'ROUND_OVER') {
    const isRoundWinner = roundWinner === 'me';
    const displayWinnerName = isRoundWinner ? myName : opponentName;
    
    return (
      <div className="min-h-screen bg-background-dark flex flex-col font-space relative overflow-hidden">
        {/* Scanlines Overlay */}
        <div className="scanlines pointer-events-none" />

        {/* Background Effects */}
        <div className={`absolute top-0 left-0 w-64 h-64 ${isRoundWinner ? 'bg-primary/15' : 'bg-red-500/15'} rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse`} />
        <div className={`absolute bottom-0 right-0 w-80 h-80 ${isRoundWinner ? 'bg-secondary/15' : 'bg-red-600/15'} rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none animate-pulse`} />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4">
          {/* Round Result Card */}
          <div className={`w-full bg-gradient-to-b from-surface-dark/95 to-surface-dark/80 backdrop-blur-xl rounded-3xl border-2 ${isRoundWinner ? 'border-primary/40 shadow-primary/20' : 'border-red-500/40 shadow-red-500/20'} shadow-2xl p-8 relative overflow-hidden`}>
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${isRoundWinner ? 'from-primary/10' : 'from-red-500/10'} via-transparent to-transparent rounded-3xl pointer-events-none`} />
            
            <div className="relative z-10 text-center">
              {/* Icon with glow */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className={`absolute inset-0 -m-4 ${isRoundWinner ? 'bg-primary/30' : 'bg-red-500/30'} rounded-full blur-xl animate-pulse`} />
                  <span className="relative text-7xl animate-bounce" style={{ animationDuration: '2s' }}>
                    {isRoundWinner ? '🎯' : '😔'}
                  </span>
                </div>
              </div>

              {/* Round Badge */}
              <div className={`inline-block px-4 py-1.5 mb-4 ${isRoundWinner ? 'bg-primary/10 border-primary/40' : 'bg-red-500/10 border-red-500/40'} border rounded-full`}>
                <span className={`${isRoundWinner ? 'text-primary' : 'text-red-400'} text-xs font-bold tracking-widest uppercase`}>
                  Round {gameData.roundNumber} / {gameData.format}
                </span>
              </div>
              
              {/* Title */}
              <h1 className={`text-3xl font-bold uppercase tracking-wider mb-2 ${isRoundWinner ? 'text-primary' : 'text-red-500'}`}>
                {isRoundWinner ? 'ROUND WON!' : 'ROUND LOST'}
              </h1>
              
              {/* Winner name */}
              <p className={`text-xl font-semibold mb-1 ${isRoundWinner ? 'text-green-400' : 'text-slate-300'}`}>
                {displayWinnerName}
              </p>
              <p className="text-slate-400 mb-6">
                {isRoundWinner 
                  ? '🎊 cracked the code!' 
                  : '💥 cracked your code!'}
              </p>

              {/* Score Card */}
              <div className={`p-5 bg-black/40 backdrop-blur-sm rounded-2xl border ${isRoundWinner ? 'border-slate-700/50' : 'border-red-900/50'} mb-6`}>
                <p className="text-slate-500 text-xs uppercase mb-2 tracking-wider">Match Score</p>
                <div className="flex justify-center items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{gameData.scores.me}</p>
                    <p className="text-xs text-slate-500">You</p>
                  </div>
                  <div className="text-2xl text-slate-600">-</div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-400">{gameData.scores.opponent}</p>
                    <p className="text-xs text-slate-500">Opponent</p>
                  </div>
                </div>
              </div>

              {/* Next Round Indicator */}
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-sm font-medium animate-pulse">Preparing next round...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // ─── SETUP PHASE ───
  if (status === 'SETUP') {
    const isMySecretSubmitted = players.me.ready;
    const isOpponentReady = players.opponent.ready;
    
    // If already submitted, show waiting screen
    if (isMySecretSubmitted) {
      return (
        <div className="min-h-screen bg-[#111827] flex flex-col font-space overflow-hidden">
          <div className="scanlines pointer-events-none" />
          
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4">
            <div className="w-full max-w-sm bg-[#1f2937] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-8 text-center">
              <div className="text-6xl mb-4 animate-pulse">🔐</div>
              <h2 className="text-xl font-bold text-white mb-2">Secret Locked In!</h2>
              <p className="text-slate-400 mb-6">
                Round {gameData.roundNumber} of {gameData.format}
              </p>
              <div className="bg-slate-800 rounded-xl p-4 mb-4">
                <p className="text-primary text-lg font-bold animate-pulse">
                  ⏳ WAITING FOR OPPONENT...
                </p>
                <p className="text-slate-500 mt-2 text-sm">
                  {isOpponentReady ? '✅ Opponent is ready!' : '⏳ Opponent is setting their secret...'}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                vs {opponentName} • {gameData.difficulty === 'hard' ? '30s Timer' : 'No Timer'}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // Show SecretEntryStep (same as offline mode)
    const config = {
      digits: gameData.digits,
      format: gameData.format,
      difficulty: gameData.difficulty === 'hard' ? 'Hard' : 'Easy',
    };
    
    return (
      <SecretEntryStep
        playerNumber={1}
        config={config}
        currentSecret={secretInput}
        onSecretChange={handleSecretChange}
        onSubmit={handleSecretSubmit}
        onBack={handleBack}
        error={secretError}
      />
    );
  }
  
  // ─── GAME OVER PHASE ───
  if (status === 'GAME_OVER') {
    const isWinner = winner === 'me';
    const displayWinnerName = isWinner ? myName : opponentName;
    
    return (
      <div className="min-h-screen bg-background-dark flex flex-col font-space relative overflow-hidden">
        {/* Scanlines Overlay */}
        <div className="scanlines pointer-events-none" />

        {/* Enhanced Background Decorations */}
        <div className={`absolute top-0 left-0 w-80 h-80 ${isWinner ? 'bg-primary/10' : 'bg-red-500/10'} rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse`} />
        <div className={`absolute bottom-0 right-0 w-96 h-96 ${isWinner ? 'bg-secondary/10' : 'bg-red-600/10'} rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none animate-pulse`} style={{ animationDelay: '1s' }} />
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 ${isWinner ? 'bg-primary/5' : 'bg-red-500/5'} rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none`} />

        {/* Confetti effect for winner */}
        {isWinner && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-bounce"
                style={{
                  backgroundColor: ['#fcd34d', '#60a5fa', '#34d399', '#f472b6', '#a78bfa'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4">
          {/* Main Card Container */}
          <div className={`w-full bg-gradient-to-b from-surface-dark/95 to-surface-dark/80 backdrop-blur-xl rounded-3xl border-2 ${isWinner ? 'border-primary/30 shadow-primary/20' : 'border-red-500/30 shadow-red-500/20'} shadow-2xl p-8 relative overflow-hidden`}>
            {/* Glow effect on card edges */}
            <div className={`absolute inset-0 bg-gradient-to-br ${isWinner ? 'from-primary/5 via-transparent to-secondary/5' : 'from-red-500/5 via-transparent to-red-600/5'} rounded-3xl pointer-events-none`} />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Glow ring */}
                  <div className={`absolute inset-0 -m-4 ${isWinner ? 'bg-primary/20' : 'bg-red-500/20'} rounded-full blur-xl animate-pulse`} />
                  <div className={`relative ${isWinner ? 'text-primary drop-shadow-[0_0_30px_rgba(250,204,20,0.8)]' : 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]'} animate-bounce`}>
                    <span className="text-8xl">{isWinner ? '🏆' : '💔'}</span>
                  </div>
                </div>
              </div>

              {/* Victory/Defeat Badge */}
              <div className="text-center mb-6">
                <div className={`inline-block px-6 py-2 ${isWinner ? 'bg-primary/10 border-primary/40' : 'bg-red-500/10 border-red-500/40'} border-2 rounded-full backdrop-blur-sm mb-4`}>
                  <span className={`${isWinner ? 'text-primary' : 'text-red-400'} text-sm font-bold tracking-widest uppercase`}>
                    {isWinner ? '⚡ Victory ⚡' : '💀 Defeat 💀'}
                  </span>
                </div>
              </div>

              {/* Winner Text */}
              <h2 className={`text-3xl font-bold text-center mb-3 bg-gradient-to-r ${isWinner ? 'from-primary via-yellow-300 to-primary' : 'from-red-400 via-red-300 to-red-400'} bg-clip-text text-transparent`}>
                {displayWinnerName}
              </h2>
              <p className="text-xl font-bold text-white text-center mb-2">
                {isWinner ? 'WINS THE MATCH!' : 'WINS THE MATCH'}
              </p>
              <p className="text-lg text-center mb-6">
                <span className={isWinner ? 'text-green-400' : 'text-slate-400'}>
                  {gameOverReason === 'disconnect' || gameOverReason === 'opponent_quit'
                    ? '🚪 Opponent left the game!' 
                    : isWinner 
                      ? '🎊 Outstanding Performance!' 
                      : '💪 Better luck next time!'}
                </span>
              </p>

              {/* Stats Card */}
              <div className={`mb-8 p-6 bg-black/40 backdrop-blur-sm rounded-2xl border-2 ${isWinner ? 'border-slate-700/50' : 'border-red-900/50'} shadow-inner relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${isWinner ? 'from-primary/5' : 'from-red-500/5'} to-transparent pointer-events-none`} />
                <div className="relative z-10">
                  <div className="text-center text-slate-400 text-sm mb-3 uppercase tracking-wider font-semibold">Final Score</div>
                  <div className="text-center text-5xl font-bold text-white font-mono mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {gameData.scores.me} - {gameData.scores.opponent}
                  </div>
                  <div className="flex justify-center gap-4 mt-4 text-sm">
                    <div className="text-center">
                      <p className="text-primary font-bold">{myName}</p>
                      <p className="text-slate-500">You</p>
                    </div>
                    <div className="text-slate-600">vs</div>
                    <div className="text-center">
                      <p className="text-blue-400 font-bold">{opponentName}</p>
                      <p className="text-slate-500">Opponent</p>
                    </div>
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    <div className={`w-2 h-2 ${isWinner ? 'bg-primary' : 'bg-red-500'} rounded-full animate-pulse`} />
                    <div className={`w-2 h-2 ${isWinner ? 'bg-primary' : 'bg-red-500'} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }} />
                    <div className={`w-2 h-2 ${isWinner ? 'bg-primary' : 'bg-red-500'} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>

              {/* Match Info */}
              <div className="flex justify-center gap-4 mb-6 text-xs text-slate-500">
                <span>🎮 Best of {gameData.format}</span>
                <span>•</span>
                <span>{gameData.digits} Digits</span>
                <span>•</span>
                <span>{gameData.difficulty === 'hard' ? '⚡ Hard Mode' : '😊 Easy Mode'}</span>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button
                  onClick={handlePlayAgain}
                  className={`w-full py-4 rounded-2xl bg-gradient-to-r ${isWinner ? 'from-primary via-yellow-400 to-primary shadow-[0_0_30px_rgba(250,204,20,0.5)] hover:shadow-[0_0_50px_rgba(250,204,20,0.8)]' : 'from-blue-500 via-blue-400 to-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_50px_rgba(59,130,246,0.8)]'} text-black font-bold text-lg transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-wider relative overflow-hidden group`}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative">🔄 Play Again</span>
                </button>
                <button
                  onClick={handleQuit}
                  className="w-full py-4 rounded-2xl bg-surface-dark/60 backdrop-blur-sm text-slate-300 font-semibold text-base border-2 border-slate-600/50 hover:bg-slate-700/80 hover:border-slate-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/30 flex items-center justify-center gap-2"
                >
                  <span>🏠 Back to Home</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 ${isWinner ? 'bg-primary/30' : 'bg-red-500/30'} rounded-full animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  
  // ─── PLAYING PHASE - Use GameArena ───
  return (
    <GameArena
      turn={isMyTurn ? 'me' : 'opponent'}
      difficulty={gameData.difficulty === 'hard' ? 'Hard' : 'Easy'}
      config={{
        currentMatch: gameData.roundNumber,
        totalMatches: gameData.format,
        score: `${gameData.scores.me}-${gameData.scores.opponent}`,
      }}
      logs={combinedLogs}
      onGuess={handleGuess}
      timer={gameData.timer}
      maxTime={30}
      digits={gameData.digits}
      isGameOver={false}
      winner={null}
      myName={myName}
      opponentName={opponentName}
      myAttempts={gameData.myLogs.length}
      opponentAttempts={gameData.opponentLogs.length}
      myWins={gameData.scores.me}
      opponentWins={gameData.scores.opponent}
      onPlayAgain={handlePlayAgain}
      onQuit={handleQuit}
      onBack={handleBack}
      isOnlineMode={true}
    />
  );
};

export default OnlineGamePage;
