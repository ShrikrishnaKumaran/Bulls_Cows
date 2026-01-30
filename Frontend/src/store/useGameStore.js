/**
 * ============================================================
 * useGameStore - Online Game State Management (Zustand)
 * ============================================================
 * 
 * Manages the state for online 1v1 games:
 * - Game phase tracking (SETUP → PLAYING → GAME_OVER)
 * - Secret submission and turn management
 * - Score tracking for best-of-N format
 * - Socket event listeners for real-time updates
 * 
 * State Flow:
 * 1. initializeGame() - Called when entering a room
 * 2. submitSecret() - Player submits their secret number
 * 3. makeGuess() - Player makes a guess (when it's their turn)
 * 4. Socket events update state automatically
 * 5. resetGame() - Clear state when leaving
 */

import { create } from 'zustand';
import { getSocket } from '../services/socket';

const useGameStore = create((set, get) => ({
  // ═══════════════════════════════════════════════════════════
  // GAME STATE
  // ═══════════════════════════════════════════════════════════
  
  gameState: 'SETUP',        // 'SETUP' | 'PLAYING' | 'GAME_OVER'
  roomCode: null,            // Current room code
  currentTurn: null,         // User ID of whose turn it is
  logs: [],                  // Game history: [{ player, playerName, guess, bulls, cows, shit }]
  
  // Round & Score Tracking
  roundNumber: 1,            // Current round (1-based)
  scores: {},                // { oderId: wins } for best-of format
  format: 3,                 // Best of 1, 3, or 5
  digits: 4,                 // Number of digits (3 or 4)
  
  // Player Info
  hostId: null,              // Host user ID
  opponentId: null,          // Opponent user ID
  myoderId: null,            // Current user's ID
  
  // Secret Tracking (local only - NEVER sent to server in state)
  mySecret: '',              // Player's own secret number
  isMySecretSubmitted: false,
  isOpponentReady: false,    // Has opponent submitted their secret?
  
  // Game Result
  winner: null,              // Winner's user ID
  winnerName: null,          // Winner's username
  
  // UI State
  loading: false,
  error: null,

  // ═══════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Initialize game state when entering a room
   * @param {string} roomCode - Room code
   * @param {Object} gameData - Initial game settings
   */
  initializeGame: (roomCode, gameData = {}) => {
    const socket = getSocket();
    set({
      gameState: 'SETUP',
      roomCode,
      mySecret: '',
      currentTurn: null,
      logs: [],
      winner: null,
      winnerName: null,
      isOpponentReady: false,
      isMySecretSubmitted: false,
      roundNumber: gameData.roundNumber || 1,
      scores: gameData.scores || {},
      format: gameData.format || 3,
      digits: gameData.digits || 4,
      hostId: gameData.hostId || null,
      opponentId: gameData.opponentId || null,
      myoderId: socket.id,
      error: null,
    });
  },

  /**
   * Submit secret number to server
   * @param {string} secret - The secret number
   * @param {Function} callback - Response callback
   */
  submitSecret: (secret, callback) => {
    const { roomCode } = get();
    const socket = getSocket();
    
    set({ mySecret: secret });
    
    socket.emit('submit-secret', { roomCode, secret }, (response) => {
      if (response.success) {
        set({ isMySecretSubmitted: true });
      }
      if (callback) callback(response);
    });
  },

  /**
   * Submit a guess against opponent's secret
   * @param {string} guess - The guess
   * @param {Function} callback - Response callback
   */
  makeGuess: (guess, callback) => {
    const { roomCode } = get();
    const socket = getSocket();
    
    socket.emit('submit-guess', { roomCode, guess }, (response) => {
      if (callback) callback(response);
    });
  },

  /**
   * Request current game state from server (for reconnection)
   * @param {Function} callback - Response callback
   */
  requestGameState: (callback) => {
    const { roomCode } = get();
    const socket = getSocket();
    
    socket.emit('game-init', { roomCode }, (response) => {
      if (response.success) {
        const { gameState: state } = response;
        set({
          gameState: state.status,
          currentTurn: state.currentTurn,
          logs: state.logs || [],
          roundNumber: state.roundNumber || 1,
          scores: state.scores || {},
          isOpponentReady: state.opponentReady,
          isMySecretSubmitted: state.hostReady || state.opponentReady,
        });
      }
      if (callback) callback(response);
    });
  },

  // ═══════════════════════════════════════════════════════════
  // SOCKET LISTENERS
  // Call setupSocketListeners() when entering game
  // Call removeSocketListeners() when leaving game
  // ═══════════════════════════════════════════════════════════

  setupSocketListeners: () => {
    const socket = getSocket();

    // Both players ready - game starts
    socket.on('match-start', (data) => {
      set({
        gameState: 'PLAYING',
        currentTurn: data.currentTurn,
        roundNumber: data.roundNumber || 1,
      });
    });

    // A guess was made - update logs and turn
    socket.on('turn-result', (data) => {
      set((state) => ({
        logs: [...state.logs, {
          player: data.player,
          playerName: data.playerName,
          guess: data.guess,
          bulls: data.bulls,
          cows: data.cows,
          shit: data.shit,
          timestamp: data.timestamp,
        }],
        currentTurn: data.nextTurn,
      }));
    });

    // Match finished - show winner
    socket.on('game-over', (data) => {
      set({
        gameState: 'GAME_OVER',
        winner: data.winner,
        winnerName: data.winnerName,
        scores: data.finalScores,
      });
    });

    // Round won - reset for next round (best-of format)
    socket.on('round-over', (data) => {
      // Brief delay to show round result
      setTimeout(() => {
        set({
          gameState: 'SETUP',
          mySecret: '',
          currentTurn: null,
          logs: [],
          isOpponentReady: false,
          isMySecretSubmitted: false,
          roundNumber: data.nextRound,
          scores: data.scores,
        });
      }, 3000);
    });

    // Opponent submitted their secret
    socket.on('opponent-ready', () => {
      set({ isOpponentReady: true });
    });
  },

  removeSocketListeners: () => {
    try {
      const socket = getSocket();
      socket.off('match-start');
      socket.off('turn-result');
      socket.off('game-over');
      socket.off('round-over');
      socket.off('opponent-ready');
    } catch {
      // Socket might not be initialized
    }
  },

  // ═══════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════

  resetGame: () => {
    set({
      gameState: 'SETUP',
      roomCode: null,
      mySecret: '',
      currentTurn: null,
      logs: [],
      winner: null,
      winnerName: null,
      isOpponentReady: false,
      isMySecretSubmitted: false,
      roundNumber: 1,
      scores: {},
      loading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useGameStore;
