import { create } from 'zustand';
import { calculateBullsAndCows } from '../utils/gameRules';

const useOfflineGameStore = create((set, get) => ({
  // ═══════════════════════════════════════════════════════════
  // SETUP WIZARD STATE
  // ═══════════════════════════════════════════════════════════
  
  setupStep: 1, // 1 = Config, 2 = P1 Secret, 3 = Handover, 4 = P2 Secret
  config: {
    digits: 4,        // 3 or 4
    difficulty: 'Easy', // 'Easy' or 'Hard'
    format: 1         // 1 = Single, 3 = Best of 3, 5 = Best of 5
  },
  
  // ═══════════════════════════════════════════════════════════
  // GAME STATE
  // ═══════════════════════════════════════════════════════════
  
  gamePhase: 'SETUP', // 'SETUP' | 'PLAYING' | 'GAME_OVER'
  turn: 'PLAYER_1', // 'PLAYER_1' | 'PLAYER_2'
  digits: 4, // 3 or 4 digits game (kept for backward compatibility)
  
  // Player Secrets
  player1Secret: '',
  player2Secret: '',
  
  // Guess History
  player1Guesses: [],
  player2Guesses: [],
  
  // Game Results
  winner: null, // 'PLAYER_1' | 'PLAYER_2' | 'DRAW' | null
  roundWinner: null, // Track who won the last round
  
  // Score Tracking (for Best of X format)
  score: {
    player1: 0,
    player2: 0
  },
  currentRound: 1, // Current round number
  
  // ═══════════════════════════════════════════════════════════
  // SETUP WIZARD ACTIONS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Move to a specific setup step
   */
  setStep: (step) => set({ setupStep: step }),
  
  /**
   * Update a config value (digits or difficulty)
   */
  setConfig: (key, value) => set((state) => ({
    config: { ...state.config, [key]: value }
  })),
  
  /**
   * Set a player's secret (1 or 2)
   */
  setSecret: (player, code) => {
    if (player === 1) {
      set({ player1Secret: code });
    } else {
      set({ player2Secret: code });
    }
  },
  
  /**
   * Reset the setup wizard to step 1
   */
  resetSetup: () => set({
    setupStep: 1,
    gamePhase: 'SETUP',
    config: { digits: 4, difficulty: 'Easy', format: 1 },
    player1Secret: '',
    player2Secret: '',
    player1Guesses: [],
    player2Guesses: [],
    winner: null,
    roundWinner: null,
    score: { player1: 0, player2: 0 },
    currentRound: 1,
    turn: 'PLAYER_1'
  }),
  
  // ═══════════════════════════════════════════════════════════
  // GAME ACTIONS (Existing)
  // ═══════════════════════════════════════════════════════════
  
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
    const { player1Secret, player2Secret, digits, turn } = get();
    
    // Validate both secrets
    if (!player1Secret || player1Secret.length !== digits) {
      return { success: false, error: 'Player 1 secret is invalid' };
    }
    
    if (!player2Secret || player2Secret.length !== digits) {
      return { success: false, error: 'Player 2 secret is invalid' };
    }
    
    set({ 
      gamePhase: 'PLAYING',
      // Preserve the turn if it was set (e.g., loser goes first), otherwise default to PLAYER_1
      turn: turn || 'PLAYER_1',
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
      
      // Check if Player 1 won this round
      if (result.isWin) {
        const { score, config, currentRound } = get();
        const newScore = { ...score, player1: score.player1 + 1 };
        
        // Check if Player 1 won the match (Best of X)
        const requiredWins = Math.ceil(config.format / 2);
        if (newScore.player1 >= requiredWins) {
          set({
            player1Guesses: updatedGuesses,
            gamePhase: 'GAME_OVER',
            winner: 'PLAYER_1',
            score: newScore
          });
        } else {
          // Show round over screen
          set({
            player1Guesses: updatedGuesses,
            gamePhase: 'ROUND_OVER',
            roundWinner: 'PLAYER_1',
            score: newScore
          });
        }
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
      
      // Check if Player 2 won this round
      if (result.isWin) {
        const { score, config, currentRound } = get();
        const newScore = { ...score, player2: score.player2 + 1 };
        
        // Check if Player 2 won the match (Best of X)
        const requiredWins = Math.ceil(config.format / 2);
        if (newScore.player2 >= requiredWins) {
          set({
            player2Guesses: updatedGuesses,
            gamePhase: 'GAME_OVER',
            winner: 'PLAYER_2',
            score: newScore
          });
        } else {
          // Show round over screen
          set({
            player2Guesses: updatedGuesses,
            gamePhase: 'ROUND_OVER',
            roundWinner: 'PLAYER_2',
            score: newScore
          });
        }
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
   * Continue to next round (after round over screen)
   * The loser of the previous round will guess first in the next round
   */
  continueToNextRound: () => {
    const { roundWinner, currentRound } = get();
    const loser = roundWinner === 'PLAYER_1' ? 'PLAYER_2' : 'PLAYER_1';
    
    set({
      player1Guesses: [],
      player2Guesses: [],
      player1Secret: '',
      player2Secret: '',
      gamePhase: 'SETUP',
      setupStep: 2, // Skip config, go straight to P1 secret entry
      turn: loser, // Loser will make the first guess
      currentRound: currentRound + 1,
      roundWinner: null
    });
  },

  /**
   * Skip turn (when timer runs out in Hard mode)
   */
  skipTurn: () => {
    const { turn, gamePhase } = get();
    if (gamePhase !== 'PLAYING') return;
    
    set({
      turn: turn === 'PLAYER_1' ? 'PLAYER_2' : 'PLAYER_1'
    });
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
    winner: null,
    roundWinner: null,
    score: { player1: 0, player2: 0 },
    currentRound: 1
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
    winner: null,
    roundWinner: null,
    score: { player1: 0, player2: 0 },
    currentRound: 1
  })
}));

export default useOfflineGameStore;
