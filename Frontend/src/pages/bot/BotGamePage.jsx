/**
 * BotGamePage - VS Bot Game Logic Container
 * 
 * Connects GameArena to the Bot game store.
 * Handles:
 * - Player turn + timer (Hard mode)
 * - Bot turn with thinking simulation via useBot hook
 * - Turn switching, round management, game over
 * - Bot thinking UI overlay with taunts
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useBotGameStore from '../../store/useBotGameStore';
import useBot from '../../hooks/useBot';
import { GameArena } from '../../components/game';
import RoundOverScreen from '../../components/game/RoundOverScreen';
import { DIFFICULTY, TIMER, HARD_MODE_HISTORY_LIMIT } from '../../utils/constants';
import { BOT_NAMES, getRandomTaunt } from '../../utils/botLogic';

function BotGamePage() {
  const navigate = useNavigate();

  // ─── STORE ───
  const {
    gamePhase,
    turn,
    config,
    playerGuesses,
    botGuesses,
    winner,
    roundWinner,
    score,
    currentRound,
    botThinking,
    lastBotTaunt,
    submitPlayerGuess,
    recordBotGuess,
    setBotThinking,
    setLastBotTaunt,
    skipTurn,
    resetGame,
    resetSetup,
    continueToNextRound,
  } = useBotGameStore();

  // ─── BOT HOOK ───
  const { makeMove, resetBot, candidatesLeft } = useBot(
    config.botDifficulty,
    config.digits
  );

  // ─── TIMER (Hard mode, player turn only) ───
  const [timer, setTimer] = useState(TIMER.MAX_TIME_HARD);
  const timerExpiredRef = useRef(false);

  // Track last bot feedback for the bot's next move
  const lastBotFeedbackRef = useRef(null);

  // Redirect to setup if not playing
  useEffect(() => {
    if (gamePhase !== 'PLAYING' && gamePhase !== 'GAME_OVER' && gamePhase !== 'ROUND_OVER') {
      navigate('/bot/setup');
    }
  }, [gamePhase, navigate]);

  // ─── TIMER LOGIC (Hard mode, player turn) ───
  useEffect(() => {
    if (config.difficulty !== DIFFICULTY.HARD || gamePhase !== 'PLAYING' || turn !== 'PLAYER') return;

    timerExpiredRef.current = false;
    setTimer(TIMER.MAX_TIME_HARD);

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          timerExpiredRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, TIMER.TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [config.difficulty, gamePhase, turn]);

  // Handle timer expiration
  useEffect(() => {
    if (timer === 0 && timerExpiredRef.current && gamePhase === 'PLAYING' && turn === 'PLAYER') {
      timerExpiredRef.current = false;
      skipTurn(); // Skip to bot's turn
    }
  }, [timer, gamePhase, turn, skipTurn]);

  // ─── BOT TURN LOGIC ───
  useEffect(() => {
    if (turn !== 'BOT' || gamePhase !== 'PLAYING') return;

    // Start bot thinking
    setBotThinking(true);
    const taunt = getRandomTaunt(config.botDifficulty, 'thinking');
    setLastBotTaunt(taunt);

    // Bot makes a move
    makeMove(lastBotFeedbackRef.current).then((botGuess) => {
      if (!botGuess) return;

      // Record the bot's guess
      const { result, isWin } = recordBotGuess(botGuess);
      
      // Store feedback for next bot move
      lastBotFeedbackRef.current = {
        bulls: result.bulls,
        cows: result.cows,
      };

      if (isWin) {
        const loseTaunt = getRandomTaunt(config.botDifficulty, 'win');
        setLastBotTaunt(loseTaunt);
      } else {
        const guessTaunt = getRandomTaunt(config.botDifficulty, 'guess');
        setLastBotTaunt(guessTaunt);
      }

      setBotThinking(false);
    });
  }, [turn, gamePhase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── RESET BOT ON NEW ROUND ───
  useEffect(() => {
    if (gamePhase === 'SETUP') {
      resetBot();
      lastBotFeedbackRef.current = null;
    }
  }, [gamePhase, resetBot]);

  // ─── HANDLERS ───
  const handleGuess = useCallback((guess) => {
    submitPlayerGuess(guess);
    // After player guesses, turn switches to BOT automatically via store
  }, [submitPlayerGuess]);

  const handlePlayAgain = useCallback(() => {
    resetSetup();
    navigate('/bot/setup');
  }, [resetSetup, navigate]);

  const handleQuit = useCallback(() => {
    resetGame();
    navigate('/home');
  }, [resetGame, navigate]);

  const handleBack = useCallback(() => {
    resetGame();
    resetSetup();
    navigate('/home');
  }, [resetGame, resetSetup, navigate]);

  const handleContinueRound = useCallback(() => {
    continueToNextRound();
    navigate('/bot/setup');
  }, [continueToNextRound, navigate]);

  // ─── MAP STORE TO ARENA PROPS ───
  const isPlayerTurn = turn === 'PLAYER';
  const currentTurn = isPlayerTurn ? 'me' : 'opponent';

  const botName = BOT_NAMES[config.botDifficulty] || 'BOT';

  // Merge and sort logs
  const logs = useMemo(() => {
    const isHardMode = config.difficulty === DIFFICULTY.HARD;

    const limitedPlayerGuesses = isHardMode 
      ? playerGuesses.slice(-HARD_MODE_HISTORY_LIMIT) 
      : playerGuesses;
    const limitedBotGuesses = isHardMode 
      ? botGuesses.slice(-HARD_MODE_HISTORY_LIMIT) 
      : botGuesses;

    const combined = [
      ...limitedPlayerGuesses.map(g => ({
        id: `player-${g.attempt}`,
        player: 'me',
        guess: g.guess,
        bulls: g.bulls,
        cows: g.cows,
        timestamp: `#${g.attempt}`,
      })),
      ...limitedBotGuesses.map(g => ({
        id: `bot-${g.attempt}`,
        player: 'opponent',
        guess: g.guess,
        bulls: g.bulls,
        cows: g.cows,
        timestamp: `#${g.attempt}`,
      })),
    ];

    return combined.sort((a, b) => {
      const aNum = parseInt(a.timestamp.slice(1));
      const bNum = parseInt(b.timestamp.slice(1));
      return aNum - bNum;
    });
  }, [playerGuesses, botGuesses, config.difficulty]);

  const myAttempts = playerGuesses.length;
  const opponentAttempts = botGuesses.length;

  // ─── ROUND OVER SCREEN ───
  if (gamePhase === 'ROUND_OVER') {
    const winnerIsPlayer = roundWinner === 'PLAYER';
    const winnerName = winnerIsPlayer ? 'YOU' : botName;
    const loserName = winnerIsPlayer ? botName : 'YOU';

    return (
      <RoundOverScreen
        roundWinner={winnerIsPlayer ? 'PLAYER_1' : 'PLAYER_2'}
        winnerName={winnerName}
        loserName={loserName}
        currentScore={`${score.player}-${score.bot}`}
        currentRound={currentRound}
        totalRounds={config.format}
        onContinue={handleContinueRound}
      />
    );
  }

  // ─── MAIN GAME ───
  return (
    <div className="relative">
      {/* Bot Thinking Overlay */}
      {botThinking && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="mt-20 bg-slate-900/95 backdrop-blur-xl border border-purple-500/40 rounded-2xl px-6 py-4 shadow-[0_0_30px_rgba(168,85,247,0.3)] max-w-xs mx-4">
            <div className="flex items-center gap-3">
              {/* Animated bot icon */}
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                  ${config.botDifficulty === 'Hard' 
                    ? 'bg-red-500/20 border border-red-500/40' 
                    : 'bg-green-500/20 border border-green-500/40'}
                `}>
                  🤖
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping" />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold uppercase tracking-wider
                  ${config.botDifficulty === 'Hard' ? 'text-red-400' : 'text-green-400'}
                `}>
                  {botName}
                </p>
                <p className="text-[11px] text-slate-400 italic mt-0.5 animate-pulse">
                  {lastBotTaunt || 'Calculating...'}
                </p>
              </div>
              {/* Spinner */}
              <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
            {config.botDifficulty === 'Hard' && (
              <div className="mt-2 text-[9px] text-slate-500 text-center font-mono">
                {candidatesLeft} possibilities remaining
              </div>
            )}
          </div>
        </div>
      )}

      <GameArena
        turn={currentTurn}
        difficulty={config.difficulty}
        config={{
          currentMatch: currentRound,
          totalMatches: config.format,
          score: `${score.player}-${score.bot}`,
        }}
        logs={logs}
        onGuess={handleGuess}
        timer={timer}
        maxTime={TIMER.MAX_TIME_HARD}
        digits={config.digits}
        isGameOver={gamePhase === 'GAME_OVER'}
        winner={winner === 'PLAYER' ? 'me' : winner === 'BOT' ? 'opponent' : winner}
        myName="YOU"
        opponentName={botName}
        myAttempts={myAttempts}
        opponentAttempts={opponentAttempts}
        myWins={score.player}
        opponentWins={score.bot}
        onPlayAgain={handlePlayAgain}
        onQuit={handleQuit}
        onBack={handleBack}
      />
    </div>
  );
}

export default BotGamePage;
