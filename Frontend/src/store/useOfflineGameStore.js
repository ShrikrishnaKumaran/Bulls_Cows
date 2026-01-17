import { create } from 'zustand';
import { calculateBullsAndCows } from '../utils/gameRules';

const useOfflineGameStore = create((set, get) => ({
  // Game State
  gamePhase: 'SETUP', // 'SETUP' | 'PLAYING' | 'GAME_OVER'
  turn: 'PLAYER_1', // 'PLAYER_1' | 'PLAYER_2'
  digits: 4, // 3 or 4 digits game
  
  // Player Secrets
  player1Secret: '',
  player2Secret: '',
  
  // Guess History
  player1Guesses: [],
  player2Guesses: [],
  
  // Game Results
  winner: null, // 'PLAYER_1' | 'PLAYER_2' | 'DRAW' | null
  
  // Actions
  
  /**
   * Set game configuration
   */
  setDigits: (digits) => set({ digits }),
  
  /**
   * Set Player 1's secret number
   */
  setPlayer1Secret: (secret) => set({ player1Secret: secret }),
  
  /**
   * Set Player 2's secret number
   */
  setPlayer2Secret: (secret) => set({ player2Secret: secret }),
  
  /**
   * Start the game after both secrets are set
   */
  startGame: () => {
    const { player1Secret, player2Secret, digits } = get();
    
    // Validate both secrets
    if (!player1Secret || player1Secret.length !== digits) {
      return { success: false, error: 'Player 1 secret is invalid' };
    }
    
    if (!player2Secret || player2Secret.length !== digits) {
      return { success: false, error: 'Player 2 secret is invalid' };
    }
    
    set({ 
      gamePhase: 'PLAYING',
      turn: 'PLAYER_1',
      player1Guesses: [],
      player2Guesses: [],
      winner: null
    });
    
    return { success: true };
  },
  
  /**
   * Submit a guess for the current player
   */
  submitGuess: (guess) => {
    const { turn, player1Secret, player2Secret, player1Guesses, player2Guesses, digits } = get();
    
    if (turn === 'PLAYER_1') {
      // Player 1 is guessing Player 2's secret
      const result = calculateBullsAndCows(player2Secret, guess, digits);
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      const newGuess = {
        guess,
        bulls: result.bulls,
        cows: result.cows,
        shit: result.shit,
        attempt: player1Guesses.length + 1
      };
      
      const updatedGuesses = [...player1Guesses, newGuess];
      
      // Check if Player 1 won
      if (result.isWin) {
        set({
          player1Guesses: updatedGuesses,
          gamePhase: 'GAME_OVER',
          winner: 'PLAYER_1'
        });
        return { success: true, result, isWin: true };
      }
      
      // Switch turn to Player 2
      set({
        player1Guesses: updatedGuesses,
        turn: 'PLAYER_2'
      });
      
      return { success: true, result, isWin: false };
      
    } else {
      // Player 2 is guessing Player 1's secret
      const result = calculateBullsAndCows(player1Secret, guess, digits);
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      const newGuess = {
        guess,
        bulls: result.bulls,
        cows: result.cows,
        shit: result.shit,
        attempt: player2Guesses.length + 1
      };
      
      const updatedGuesses = [...player2Guesses, newGuess];
      
      // Check if Player 2 won
      if (result.isWin) {
        set({
          player2Guesses: updatedGuesses,
          gamePhase: 'GAME_OVER',
          winner: 'PLAYER_2'
        });
        return { success: true, result, isWin: true };
      }
      
      // Switch turn to Player 1
      set({
        player2Guesses: updatedGuesses,
        turn: 'PLAYER_1'
      });
      
      return { success: true, result, isWin: false };
    }
  },
  
  /**
   * Reset the game to initial state
   */
  resetGame: () => set({
    gamePhase: 'SETUP',
    turn: 'PLAYER_1',
    player1Secret: '',
    player2Secret: '',
    player1Guesses: [],
    player2Guesses: [],
    winner: null
  }),
  
  /**
   * Play again with same settings
   */
  playAgain: () => set({
    gamePhase: 'SETUP',
    turn: 'PLAYER_1',
    player1Secret: '',
    player2Secret: '',
    player1Guesses: [],
    player2Guesses: [],
    winner: null
  })
}));

export default useOfflineGameStore;
