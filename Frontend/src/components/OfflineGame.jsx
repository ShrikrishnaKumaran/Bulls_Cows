/**
 * OfflineGame - Offline Game Logic Container
 * 
 * Connects the GameArena to the Offline (Pass & Play) store.
 * Handles turn switching, timer (Hard mode), and game flow.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useOfflineGameStore from '../store/useOfflineGameStore';
import GameArena from './game/GameArena';

function OfflineGame() {
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

  // Redirect to setup if not playing
  useEffect(() => {
    if (gamePhase !== 'PLAYING' && gamePhase !== 'GAME_OVER') {
      navigate('/offline/setup');
    }
  }, [gamePhase, navigate]);

  // Timer logic for Hard mode
  useEffect(() => {
    if (config.difficulty !== 'Hard' || gamePhase !== 'PLAYING') return;
    
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Time's up! Skip to next player's turn
          skipTurn();
          return MAX_TIME;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [config.difficulty, gamePhase, turn, skipTurn]);

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
    navigate('/');
  }, [resetGame, navigate]);

  // ─── MAP STORE TO ARENA PROPS ───

  // Determine whose turn it is (for Pass & Play, alternate between players)
  const isPlayer1Turn = turn === 'PLAYER_1';
  
  // Pass turn info to arena - 'me' means Player 1's turn, 'opponent' means Player 2's turn
  const currentTurn = isPlayer1Turn ? 'me' : 'opponent';
  
  // Combine logs with player info - FIXED positions (P1 = 'me', P2 = 'opponent')
  // Player 1's guesses always marked as 'me', Player 2's always as 'opponent'
  const logs = [
    ...player1Guesses.map(g => ({
      player: 'me', // Player 1's guesses always on left
      guess: g.guess,
      bulls: g.bulls,
      cows: g.cows,
      timestamp: `#${g.attempt}`
    })),
    ...player2Guesses.map(g => ({
      player: 'opponent', // Player 2's guesses always on right
      guess: g.guess,
      bulls: g.bulls,
      cows: g.cows,
      timestamp: `#${g.attempt}`
    }))
  ].sort((a, b) => {
    // Sort by attempt number
    const aNum = parseInt(a.timestamp.slice(1));
    const bNum = parseInt(b.timestamp.slice(1));
    return aNum - bNum;
  });

  // Config for display
  const formatLabel = config.format === 1 ? 'Single' : `Best of ${config.format}`;
  
  // Calculate attempts for each player - FIXED (P1 left, P2 right)
  const myAttempts = player1Guesses.length;
  const opponentAttempts = player2Guesses.length;
  
  // Determine winner mapping
  const arenaWinner = winner;

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

export default OfflineGame;
