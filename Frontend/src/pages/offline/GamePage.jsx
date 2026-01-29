/**
 * OfflineGamePage - Offline Game Logic Container
 * 
 * Connects the GameArena to the Offline (Pass & Play) store.
 * Handles turn switching, timer (Hard mode), and game flow.
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useOfflineGameStore from '../../store/useOfflineGameStore';
import { GameArena } from '../../components/game';
import RoundOverScreen from '../../components/game/RoundOverScreen';
import { DIFFICULTY, TIMER, GAME_PHASE, ROUTES } from '../../utils/constants';

function OfflineGamePage() {
  const navigate = useNavigate();

  // Store state
  const {
    gamePhase,
    turn,
    digits,
    config,
    player1Guesses,
    player2Guesses,
    winner,
    roundWinner,
    score,
    currentRound,
    submitGuess,
    skipTurn,
    resetGame,
    resetSetup,
    continueToNextRound
  } = useOfflineGameStore();

  // Timer state (for Hard mode)
  const [timer, setTimer] = useState(TIMER.MAX_TIME_HARD);
  const timerExpiredRef = useRef(false);

  // Redirect to setup if not playing
  useEffect(() => {
    if (gamePhase !== GAME_PHASE.PLAYING && gamePhase !== GAME_PHASE.GAME_OVER && gamePhase !== 'ROUND_OVER') {
      navigate(ROUTES.OFFLINE_SETUP);
    }
  }, [gamePhase, navigate]);

  // Timer logic for Hard mode
  useEffect(() => {
    if (config.difficulty !== DIFFICULTY.HARD || gamePhase !== GAME_PHASE.PLAYING) return;

    timerExpiredRef.current = false;

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
    if (timer === 0 && timerExpiredRef.current && gamePhase === GAME_PHASE.PLAYING) {
      timerExpiredRef.current = false;
      skipTurn();
    }
  }, [timer, gamePhase, skipTurn]);

  // Reset timer when turn changes
  useEffect(() => {
    setTimer(TIMER.MAX_TIME_HARD);
  }, [turn]);

  // Handle guess submission
  const handleGuess = useCallback((guess) => {
    submitGuess(guess);
  }, [submitGuess]);

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    resetSetup();
    navigate(ROUTES.OFFLINE_SETUP);
  }, [resetSetup, navigate]);

  // Handle quit
  const handleQuit = useCallback(() => {
    resetGame();
    navigate(ROUTES.HOME);
  }, [resetGame, navigate]);

  // Handle back button during game
  const handleBack = useCallback(() => {
    resetGame();
    resetSetup();
    navigate(ROUTES.HOME);
  }, [resetGame, resetSetup, navigate]);

  // Handle continue to next round
  const handleContinueRound = useCallback(() => {
    continueToNextRound();
    navigate(ROUTES.OFFLINE_SETUP);
  }, [continueToNextRound, navigate]);

  // ─── MAP STORE TO ARENA PROPS ───
  const isPlayer1Turn = turn === 'PLAYER_1';
  const currentTurn = isPlayer1Turn ? 'me' : 'opponent';

  // Memoize logs to prevent unnecessary re-renders and double display
  const logs = useMemo(() => {
    const combined = [
      ...player1Guesses.map(g => ({
        id: `p1-${g.attempt}`,
        player: 'me',
        guess: g.guess,
        bulls: g.bulls,
        cows: g.cows,
        timestamp: `#${g.attempt}`
      })),
      ...player2Guesses.map(g => ({
        id: `p2-${g.attempt}`,
        player: 'opponent',
        guess: g.guess,
        bulls: g.bulls,
        cows: g.cows,
        timestamp: `#${g.attempt}`
      }))
    ];
    
    return combined.sort((a, b) => {
      const aNum = parseInt(a.timestamp.slice(1));
      const bNum = parseInt(b.timestamp.slice(1));
      return aNum - bNum;
    });
  }, [player1Guesses, player2Guesses]);

  const formatLabel = config.format === 1 ? 'Single' : `Best of ${config.format}`;
  const myAttempts = player1Guesses.length;
  const opponentAttempts = player2Guesses.length;

  // ─── ROUND OVER SCREEN (Best of 3/5 only) ───
  if (gamePhase === 'ROUND_OVER') {
    const winnerIsPlayer1 = roundWinner === 'PLAYER_1';
    const winnerName = winnerIsPlayer1 ? 'PLAYER 1' : 'PLAYER 2';
    const loserName = winnerIsPlayer1 ? 'PLAYER 2' : 'PLAYER 1';

    return (
      <RoundOverScreen
        roundWinner={roundWinner}
        winnerName={winnerName}
        loserName={loserName}
        currentScore={`${score.player1}-${score.player2}`}
        currentRound={currentRound}
        totalRounds={config.format}
        onContinue={handleContinueRound}
      />
    );
  }

  return (
    <GameArena
      turn={currentTurn}
      difficulty={config.difficulty}
      config={{
        currentMatch: currentRound,
        totalMatches: config.format,
        score: `${score.player1}-${score.player2}`
      }}
      logs={logs}
      onGuess={handleGuess}
      timer={timer}
      maxTime={TIMER.MAX_TIME_HARD}
      digits={digits}
      isGameOver={gamePhase === GAME_PHASE.GAME_OVER}
      winner={winner}
      myName="PLAYER 1"
      opponentName="PLAYER 2"
      myAttempts={myAttempts}
      opponentAttempts={opponentAttempts}
      myWins={score.player1}
      opponentWins={score.player2}
      onPlayAgain={handlePlayAgain}
      onQuit={handleQuit}
      onBack={handleBack}
    />
  );
}

export default OfflineGamePage;