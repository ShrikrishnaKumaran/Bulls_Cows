import { useState, useRef, useEffect, useMemo, memo } from 'react'; // Added useMemo
import MatchInfoPill from './MatchInfoPill';
import PlayerCard from './PlayerCard';
import TimerBar from './TimerBar';
import GameLogCard from './GameLogCard';
import GameInputDrawer from './GameInputDrawer';
import GameOverScreen from './GameOverScreen';
import { Modal } from '../ui';

function GameArena({
  turn = 'me',
  difficulty = 'Easy',
  config = { currentMatch: 1, totalMatches: 1, score: '0-0' },
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
  myWins = 0,
  opponentWins = 0,
  onPlayAgain,
  onQuit,
  onBack
}) {
  const [currentGuess, setCurrentGuess] = useState('0'.repeat(digits));
  const [error, setError] = useState('');
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const logsEndRef = useRef(null);

  // ─── FIX: SORT LOGS CHRONOLOGICALLY ───
  const sortedLogs = useMemo(() => {
    // Create a safe copy of logs to avoid mutating props
    return [...logs].sort((a, b) => {
      // Extract number from "T1", "T2", "T10" etc.
      // Assumes format is like "T1" or purely numeric
      const getTurnNum = (str) => {
        if (typeof str === 'number') return str;
        if (!str) return 0;
        // Remove non-digits and parse
        const num = parseInt(str.replace(/\D/g, ''), 10); 
        return isNaN(num) ? 0 : num;
      };

      const turnA = getTurnNum(a.timestamp);
      const turnB = getTurnNum(b.timestamp);

      return turnA - turnB; // Ascending order (1, 2, 3...)
    });
  }, [logs]);

  // Reset guess when turn changes
  useEffect(() => {
    setCurrentGuess('0'.repeat(digits));
    setError('');
  }, [turn, digits]);

  // Auto-scroll logs using sortedLogs length
  useEffect(() => {
    if (sortedLogs.length === 0) return;
    
    const timeoutId = setTimeout(() => {
      const scrollContainer = logsEndRef.current?.parentElement;
      if (scrollContainer) {
        const isNearBottom = 
          scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 150; // Increased threshold slightly
        
        if (isNearBottom) {
          logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [sortedLogs.length]);

  const isHardMode = difficulty === 'Hard';
  const isMyTurn = turn === 'me';

  const handleGuessChange = (newGuess) => {
    setCurrentGuess(newGuess);
    setError('');
  };

  const handleSubmit = () => {
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
      <GameOverScreen
        winnerName={winnerName}
        winnerIsMe={winnerIsMe}
        score={`${myWins}-${opponentWins}`}
        onPlayAgain={onPlayAgain}
        onQuit={onQuit}
      />
    );
  }

  // ─── MAIN GAME UI ───
  return (
    <div className="fixed inset-0 bg-background-dark font-space flex flex-col">
      {/* Scanlines Overlay */}
      <div className="scanlines" />

      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-lg mx-auto h-full flex flex-col relative z-10">

        {/* ═══ FIXED HEADER ═══ */}
        <header className="flex-shrink-0 px-3 sm:px-4 pb-2 pt-4 sm:pt-6">
          <MatchInfoPill
            currentMatch={config.currentMatch}
            totalMatches={config.totalMatches}
            score={config.score}
            difficulty={difficulty}
          />

          <div className="flex gap-2 sm:gap-3 mt-2">
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

          {isHardMode && (
            <div className="mt-3">
              <TimerBar timer={timer} maxTime={maxTime} />
            </div>
          )}
        </header>

        {/* ═══ SCROLLABLE MOVE HISTORY ═══ */}
        <main className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-4 pt-4 pb-4 scrollbar-hide z-0 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
          <div className="space-y-3">
            {sortedLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No moves yet. Make the first guess!
              </div>
            ) : (
              sortedLogs.map((log) => {
                // Safely calculate turn number for display
                const rawTurn = log.timestamp ? log.timestamp.toString().replace(/\D/g, '') : '0';
                const turnNum = parseInt(rawTurn, 10);

                return (
                  <GameLogCard 
                    key={log.id || `turn-${turnNum}-${log.player}`} 
                    log={log} 
                    digits={digits} 
                    turnNumber={turnNum} 
                  />
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </main>

        {/* ═══ FIXED INPUT DRAWER ═══ */}
        <footer className="flex-shrink-0">
          {error && (
            <p className="text-red-400 text-sm text-center px-3 sm:px-4 pb-2">{error}</p>
          )}

          <GameInputDrawer
            value={currentGuess}
            digits={digits}
            onChange={handleGuessChange}
            onSubmit={handleSubmit}
            disabled={false}
          />
        </footer>
      </div>
      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <Modal onClose={() => setShowQuitConfirm(false)}>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Quit Game?</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to quit? All progress will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-surface-dark/80 backdrop-blur-sm text-slate-300 font-semibold border border-slate-600/50 hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowQuitConfirm(false);
                  onBack();
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
              >
                Quit
              </button>
            </div>
          </div>
        </Modal>
      )}    </div>
  );
}

export default memo(GameArena);