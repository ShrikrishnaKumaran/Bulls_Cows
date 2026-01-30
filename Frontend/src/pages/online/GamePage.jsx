/**
 * OnlineGamePage - The Arena UI for Online 1v1 Bulls & Cows
 * Cyber Minimalist Design with three phases: SETUP, PLAYING, GAME_OVER
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGameStore from '../../store/useGameStore';
import { getSocket } from '../../services/socket';
import OnlineStepper from '../../components/setup/OnlineStepper';

const OnlineGamePage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  
  const {
    gameState,
    currentTurn,
    logs,
    winner,
    winnerName,
    isOpponentReady,
    isMySecretSubmitted,
    roundNumber,
    scores,
    format,
    digits,
    submitSecret,
    makeGuess,
    setupSocketListeners,
    removeSocketListeners,
  } = useGameStore();

  const [secretInput, setSecretInput] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [error, setError] = useState('');
  const [myUserId, setMyUserId] = useState(null);

  useEffect(() => {
    const socket = getSocket();
    setMyUserId(socket.user?._id?.toString() || socket.id);
    setupSocketListeners();

    return () => {
      removeSocketListeners();
    };
  }, [setupSocketListeners, removeSocketListeners]);

  // Reset secretInput when entering a new round (SETUP phase)
  useEffect(() => {
    if (gameState === 'SETUP') {
      setSecretInput('');
      setError('');
    }
  }, [gameState, roundNumber]);

  const isMyTurn = currentTurn === myUserId;
  const myLogs = logs.filter(log => log.player === myUserId);
  const opponentLogs = logs.filter(log => log.player !== myUserId);

  const handleSubmitSecret = () => {
    setError('');
    
    if (secretInput.length !== digits) {
      setError(`Secret must be exactly ${digits} digits`);
      return;
    }
    
    if (!/^\d+$/.test(secretInput)) {
      setError('Secret must contain only numbers');
      return;
    }
    
    const uniqueDigits = new Set(secretInput.split(''));
    if (uniqueDigits.size !== digits) {
      setError('All digits must be unique');
      return;
    }

    submitSecret(secretInput, (response) => {
      if (!response.success) {
        setError(response.message);
      }
    });
  };

  const handleSubmitGuess = () => {
    setError('');
    
    if (guessInput.length !== digits) {
      setError(`Guess must be exactly ${digits} digits`);
      return;
    }
    
    if (!/^\d+$/.test(guessInput)) {
      setError('Guess must contain only numbers');
      return;
    }
    
    const uniqueDigits = new Set(guessInput.split(''));
    if (uniqueDigits.size !== digits) {
      setError('All digits must be unique');
      return;
    }

    makeGuess(guessInput, (response) => {
      if (response.success) {
        setGuessInput('');
      } else {
        setError(response.message);
      }
    });
  };

  const handleReturnToLobby = () => {
    useGameStore.getState().resetGame();
    navigate('/home');
  };

  // Number pad component
  const NumberPad = ({ value, onChange, disabled }) => {
    const usedDigits = new Set(value.split(''));
    
    const handleDigitClick = (digit) => {
      if (value.length < digits && !usedDigits.has(digit)) {
        onChange(value + digit);
      }
    };
    
    const handleBackspace = () => {
      onChange(value.slice(0, -1));
    };

    return (
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleDigitClick(num.toString())}
            disabled={disabled || usedDigits.has(num.toString()) || value.length >= digits}
            className={`
              py-3 text-xl font-bold rounded-lg transition-all
              ${usedDigits.has(num.toString()) 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-surface-dark text-white hover:bg-primary hover:text-black'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleBackspace}
          disabled={disabled || value.length === 0}
          className="py-3 text-xl font-bold rounded-lg bg-red-900 text-red-400 hover:bg-red-800 transition-all disabled:opacity-50"
        >
          ⌫
        </button>
        <button
          onClick={() => handleDigitClick('0')}
          disabled={disabled || usedDigits.has('0') || value.length >= digits}
          className={`
            py-3 text-xl font-bold rounded-lg transition-all
            ${usedDigits.has('0') 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-surface-dark text-white hover:bg-primary hover:text-black'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          0
        </button>
        <div></div>
      </div>
    );
  };

  // Result dots component
  const ResultDots = ({ bulls, cows, shit }) => (
    <div className="flex gap-1">
      {[...Array(bulls)].map((_, i) => (
        <span key={`b${i}`} className="w-3 h-3 rounded-full bg-green-500" title="Bull" />
      ))}
      {[...Array(cows)].map((_, i) => (
        <span key={`c${i}`} className="w-3 h-3 rounded-full bg-yellow-500" title="Cow" />
      ))}
      {[...Array(shit)].map((_, i) => (
        <span key={`s${i}`} className="w-3 h-3 rounded-full bg-slate-600" title="Miss" />
      ))}
    </div>
  );

  // ============ SETUP PHASE ============
  if (gameState === 'SETUP') {
    // Calculate score display
    const myScore = scores[myUserId] || 0;
    const opponentScore = Object.entries(scores).find(([id]) => id !== myUserId)?.[1] || 0;
    
    return (
      <div className="min-h-screen bg-[#111827] flex flex-col font-space overflow-hidden">
        <div className="scanlines" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-3 sm:px-4">
          {/* Header */}
          <header className="py-4 pt-8 flex items-center gap-4">
            <div className="w-9" /> {/* Spacer for alignment */}
            <h1 className="text-lg font-bold text-white tracking-wider uppercase">
              🔐 Secret Setup
            </h1>
          </header>

          {/* Online Stepper */}
          <OnlineStepper 
            hasSubmitted={isMySecretSubmitted}
            opponentReady={isOpponentReady}
            roundNumber={roundNumber}
          />

          {/* Match Info Bar */}
          <div className="flex justify-center gap-4 mb-4">
            <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2">
              <span className="text-slate-400 text-xs uppercase tracking-wider">Match</span>
              <span className="text-primary font-bold">{roundNumber} / {format}</span>
            </div>
            {Object.keys(scores).length > 0 && (
              <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2">
                <span className="text-green-400 font-bold">{myScore}</span>
                <span className="text-slate-500">-</span>
                <span className="text-red-400 font-bold">{opponentScore}</span>
              </div>
            )}
          </div>

          <main className="flex-1 flex flex-col justify-center py-2">
            {/* Main Card */}
            <div className="w-full max-w-sm mx-auto bg-[#1f2937] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
              
              {/* Header Section */}
              <div className="bg-slate-800 p-5 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-primary font-bold tracking-wider uppercase text-sm">
                      {isMySecretSubmitted ? 'WAITING FOR SYNC' : 'ENTER YOUR SECRET'}
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">
                      {digits}-digit unique code
                    </p>
                  </div>
                  <div className="text-2xl">
                    {isMySecretSubmitted ? '📡' : '🔐'}
                  </div>
                </div>
              </div>

              {/* Secret Input Display */}
              <div className="p-6">
                <div className="flex justify-center gap-2 mb-4">
                  {[...Array(digits)].map((_, i) => (
                    <div
                      key={i}
                      className={`
                        w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold
                        border-2 transition-all duration-200
                        ${secretInput[i] 
                          ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(250,204,20,0.3)]' 
                          : 'bg-slate-800/50 border-slate-600 text-slate-600'}
                      `}
                    >
                      {secretInput[i] ? '●' : '_'}
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                {!isMySecretSubmitted ? (
                  <>
                    <NumberPad 
                      value={secretInput} 
                      onChange={setSecretInput}
                      disabled={false}
                    />
                    
                    <button
                      onClick={handleSubmitSecret}
                      disabled={secretInput.length !== digits}
                      className={`
                        w-full mt-6 py-3 px-6 rounded-xl font-bold uppercase tracking-wider
                        transition-all duration-200
                        ${secretInput.length === digits
                          ? 'bg-primary text-black shadow-[0_0_20px_rgba(250,204,20,0.5)] hover:shadow-[0_0_30px_rgba(250,204,20,0.7)] hover:scale-[1.02]'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                      `}
                    >
                      🔒 LOCK IN SECRET
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center animate-pulse">
                      <span className="text-2xl">📡</span>
                    </div>
                    <p className="text-blue-400 font-bold text-lg mb-2">
                      Syncing with opponent...
                    </p>
                    <p className="text-slate-500 text-sm">
                      {isOpponentReady 
                        ? '✅ Both players ready! Starting...' 
                        : '⏳ Waiting for opponent to set their secret...'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ============ PLAYING PHASE ============
  if (gameState === 'PLAYING') {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col">
        <header className="bg-surface-dark border-b border-slate-700 p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="text-slate-400 text-sm">
              Round {roundNumber}/{format} • Room: {roomCode}
            </div>
            <div className={`
              text-lg font-bold uppercase tracking-wider px-4 py-2 rounded-lg
              ${isMyTurn 
                ? 'bg-green-900/50 text-green-400 border border-green-500' 
                : 'bg-red-900/50 text-red-400 border border-red-500'}
            `}>
              {isMyTurn ? '🎯 YOUR TURN' : '⏳ OPPONENT\'S TURN'}
            </div>
            <div className="text-slate-400 text-sm">
              Score: {Object.values(scores).join(' - ')}
            </div>
          </div>
        </header>

        <main className="flex-1 flex max-w-4xl mx-auto w-full p-4 gap-4 overflow-hidden">
          <div className="flex-1 bg-surface-dark rounded-xl border border-slate-700 flex flex-col">
            <div className="p-3 border-b border-slate-700">
              <h2 className="text-green-400 font-bold uppercase tracking-wider text-sm">
                📡 YOUR TRANSMISSIONS
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {myLogs.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No guesses yet...</p>
              ) : (
                myLogs.map((log, i) => (
                  <div key={i} className="bg-input-bg rounded-lg p-3 flex justify-between items-center">
                    <span className="text-white font-mono text-lg tracking-widest">[{log.guess}]</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">
                        {log.bulls}B {log.cows}C
                      </span>
                      <ResultDots bulls={log.bulls} cows={log.cows} shit={log.shit} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 bg-surface-dark rounded-xl border border-slate-700 flex flex-col">
            <div className="p-3 border-b border-slate-700">
              <h2 className="text-red-400 font-bold uppercase tracking-wider text-sm">
                📡 ENEMY TRANSMISSIONS
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {opponentLogs.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No enemy guesses yet...</p>
              ) : (
                opponentLogs.map((log, i) => (
                  <div key={i} className="bg-input-bg rounded-lg p-3 flex justify-between items-center">
                    <span className="text-white font-mono text-lg tracking-widest">[{log.guess}]</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">
                        {log.bulls}B {log.cows}C
                      </span>
                      <ResultDots bulls={log.bulls} cows={log.cows} shit={log.shit} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        <footer className="bg-surface-dark border-t border-slate-700 p-4">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-2 mb-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <input
                type="text"
                value={guessInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, digits);
                  setGuessInput(val);
                  setError('');
                }}
                placeholder={`Enter ${digits}-digit guess...`}
                disabled={!isMyTurn}
                className={`
                  flex-1 bg-input-bg rounded-lg py-3 px-4 text-white text-lg font-mono tracking-widest
                  border focus:outline-none focus:ring-2 transition-all
                  ${isMyTurn 
                    ? 'border-slate-700 focus:ring-primary' 
                    : 'border-slate-800 text-slate-500 cursor-not-allowed'}
                `}
              />
              <button
                onClick={handleSubmitGuess}
                disabled={!isMyTurn || guessInput.length !== digits}
                className={`
                  px-8 py-3 rounded-lg font-bold uppercase tracking-wider
                  transition-all duration-200
                  ${isMyTurn && guessInput.length === digits
                    ? 'bg-primary text-black shadow-neon hover:shadow-neon-strong hover:scale-[1.02]'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                `}
              >
                🎯 FIRE
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ============ GAME OVER PHASE ============
  if (gameState === 'GAME_OVER') {
    const isWinner = winner === myUserId;
    
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm"></div>
        
        <div className={`
          relative z-10 w-full max-w-md bg-surface-dark rounded-xl p-8 
          border-2 ${isWinner ? 'border-primary' : 'border-red-500'}
          tech-border text-center
        `}>
          <div className="text-6xl mb-4">
            {isWinner ? '🏆' : '💀'}
          </div>
          
          <h1 className={`
            text-3xl font-bold uppercase tracking-wider mb-2
            ${isWinner ? 'text-primary glitch-text' : 'text-red-500'}
          `}>
            {isWinner ? 'MISSION ACCOMPLISHED' : 'SYSTEM FAILURE'}
          </h1>
          
          <p className="text-slate-400 mb-6">
            {isWinner 
              ? 'Target neutralized. Well played, agent.' 
              : `${winnerName || 'Opponent'} cracked your code.`}
          </p>

          <div className="bg-input-bg rounded-lg p-4 mb-6">
            <p className="text-slate-400 text-sm mb-2">FINAL SCORE</p>
            <p className="text-2xl font-bold text-white">
              {Object.values(scores).join(' - ')}
            </p>
          </div>

          <button
            onClick={handleReturnToLobby}
            className={`
              w-full py-3 px-6 rounded-lg font-bold uppercase tracking-wider
              transition-all duration-200 hover:scale-[1.02]
              ${isWinner 
                ? 'bg-primary text-black shadow-neon hover:shadow-neon-strong' 
                : 'bg-red-600 text-white hover:bg-red-500'}
            `}
          >
            ← RETURN TO HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="text-primary animate-pulse text-xl font-bold">
        Loading game...
      </div>
    </div>
  );
};

export default OnlineGamePage;
