/**
 * OfflineGamePage - Offline Game Logic Container
 * 
 * Connects the GameArena to the Offline (Pass & Play) store.
 * Handles turn switching, timer (Hard mode), and game flow.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useOfflineGameStore from '../../store/useOfflineGameStore';
import GameArena from '../../components/game/GameArena';

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
    submitGuess,
    skipTurn,
    resetGame,
    resetSetup
  } = useOfflineGameStore();

  // Timer state (for Hard mode)
  const MAX_TIME = 30;
  const [timer, setTimer] = useState(MAX_TIME);
  const timerExpiredRef = useRef(false);

  // Redirect to setup if not playing
  useEffect(() => {
    if (gamePhase !== 'PLAYING' && gamePhase !== 'GAME_OVER') {
      navigate('/offline/setup');
    }
  }, [gamePhase, navigate]);

  // Timer logic for Hard mode
  useEffect(() => {
    if (config.difficulty !== 'Hard' || gamePhase !== 'PLAYING') return;

    timerExpiredRef.current = false;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          timerExpiredRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config.difficulty, gamePhase, turn]);

  // Handle timer expiration
  useEffect(() => {
    if (timer === 0 && timerExpiredRef.current && gamePhase === 'PLAYING') {
      timerExpiredRef.current = false;
      skipTurn();
    }
  }, [timer, gamePhase, skipTurn]);

  // Reset timer when turn changes
  useEffect(() => {
    setTimer(MAX_TIME);
  }, [turn]);

  // Handle guess submission
  const handleGuess = useCallback((guess) => {
    submitGuess(guess);
  }, [submitGuess]);

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    resetSetup();
    navigate('/offline/setup');
  }, [resetSetup, navigate]);

  // Handle quit
  const handleQuit = useCallback(() => {
    resetGame();
    navigate('/home');
  }, [resetGame, navigate]);

  // ─── MAP STORE TO ARENA PROPS ───
  const isPlayer1Turn = turn === 'PLAYER_1';
  const currentTurn = isPlayer1Turn ? 'me' : 'opponent';

  // Combine logs with player info
  const logs = [
    ...player1Guesses.map(g => ({
      player: 'me',
      guess: g.guess,
      bulls: g.bulls,
      cows: g.cows,
      timestamp: `#${g.attempt}`
    })),
    ...player2Guesses.map(g => ({
      player: 'opponent',
      guess: g.guess,
      bulls: g.bulls,
      cows: g.cows,
      timestamp: `#${g.attempt}`
    }))
  ].sort((a, b) => {
    const aNum = parseInt(a.timestamp.slice(1));
    const bNum = parseInt(b.timestamp.slice(1));
    return aNum - bNum;
  });

  const formatLabel = config.format === 1 ? 'Single' : `Best of ${config.format}`;
  const myAttempts = player1Guesses.length;
  const opponentAttempts = player2Guesses.length;

  return (
    <GameArena
      turn={currentTurn}
      difficulty={config.difficulty}
      config={{
        format: formatLabel,
        score: `${player1Guesses.length}-${player2Guesses.length}`
      }}
      logs={logs}
      onGuess={handleGuess}
      timer={timer}
      maxTime={MAX_TIME}
      digits={digits}
      isGameOver={gamePhase === 'GAME_OVER'}
      winner={winner}
      myName="PLAYER 1"
      opponentName="PLAYER 2"
      myAttempts={myAttempts}
      opponentAttempts={opponentAttempts}
      onPlayAgain={handlePlayAgain}
      onQuit={handleQuit}
    />
  );
}

export default OfflineGamePage;
