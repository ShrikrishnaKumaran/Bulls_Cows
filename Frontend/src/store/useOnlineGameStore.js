/**
 * ============================================================
 * useOnlineGameStore - Online Game State Management (Zustand)
 * ============================================================
 * 
 * Dedicated store for online 1v1 multiplayer games.
 * Manages socket connection, game state, and real-time updates.
 * 
 * State Flow:
 * 1. connectSocket() - Initialize socket and listeners
 * 2. createRoom(config) / joinRoom(code) - Enter a game
 * 3. setSecret(secret) - Submit secret number
 * 4. sendGuess(guess) - Make a guess during gameplay
 * 5. disconnectSocket() - Clean up on leave
 * 
 * Game Phases:
 * - LOBBY: Waiting for opponent to join
 * - SETUP: Both players entering secrets
 * - PLAYING: Active gameplay
 * - GAME_OVER: Match complete
 */

import { create } from 'zustand';
import { getSocket, initSocket, disconnectSocket } from '../services/socket';
import useAuthStore from './useAuthStore';

// Helper to get current user ID from auth store
const getMyUserId = () => {
  const authState = useAuthStore.getState();
  return authState.user?._id;
};

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const TIMER_DURATION = 30;

const useOnlineGameStore = create((set, get) => ({
  // ═══════════════════════════════════════════════════════════
  // CONNECTION STATE
  // ═══════════════════════════════════════════════════════════
  isConnected: false,
  connectionError: null,
  
  // ═══════════════════════════════════════════════════════════
  // ROOM STATE
  // ═══════════════════════════════════════════════════════════
  roomId: null,
  roomCode: null,
  playerId: null,
  
  // ═══════════════════════════════════════════════════════════
  // GAME STATUS
  // ═══════════════════════════════════════════════════════════
  status: 'IDLE', // 'IDLE' | 'LOBBY' | 'SETUP' | 'PLAYING' | 'GAME_OVER'
  
  // ═══════════════════════════════════════════════════════════
  // PLAYERS
  // ═══════════════════════════════════════════════════════════
  players: {
    me: { name: '', oderId: '', connected: false, ready: false },
    opponent: { name: '', oderId: '', connected: false, ready: false },
  },
  isHost: false,
  
  // ═══════════════════════════════════════════════════════════
  // GAME DATA
  // ═══════════════════════════════════════════════════════════
  gameData: {
    format: 3,
    digits: 4,
    difficulty: 'easy',
    turn: null, // 'me' | 'opponent'
    currentTurnId: null,
    myLogs: [],
    opponentLogs: [],
    timer: TIMER_DURATION,
    roundNumber: 1,
    scores: { me: 0, opponent: 0 },
  },
  
  // ═══════════════════════════════════════════════════════════
  // RESULT STATE
  // ═══════════════════════════════════════════════════════════
  winner: null,
  winnerName: null,
  gameOverReason: null,
  roundWinner: null,      // 'me' | 'opponent' for round-over screen
  roundWinnerName: null,
  
  // ═══════════════════════════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════════════════════════
  loading: false,
  error: null,

  // ═══════════════════════════════════════════════════════════
  // ACTIONS: CONNECTION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Initialize socket connection and set up listeners
   * @param {string} token - JWT auth token
   */
  connectSocket: (token) => {
    try {
      const socket = initSocket(token);
      
      socket.on('connect', () => {
        set({ 
          isConnected: true, 
          connectionError: null,
          playerId: socket.id,
        });
      });
      
      socket.on('disconnect', () => {
        set({ isConnected: false });
      });
      
      socket.on('connect_error', (error) => {
        set({ 
          isConnected: false, 
          connectionError: error.message,
        });
      });
      
      // Set up game event listeners
      get().setupListeners();
      
    } catch (error) {
      set({ connectionError: error.message });
    }
  },
  
  /**
   * Disconnect socket and clean up
   */
  disconnectSocket: () => {
    get().removeListeners();
    disconnectSocket();
    set({ isConnected: false, playerId: null });
  },

  // ═══════════════════════════════════════════════════════════
  // ACTIONS: ROOM MANAGEMENT
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Create a new game room
   * @param {Object} config - { format, digits, difficulty }
   * @param {Function} callback - Response callback
   */
  createRoom: (config, callback) => {
    try {
      const socket = getSocket();
      
      if (!socket || !socket.connected) {
        const errorMsg = 'Socket not connected. Please try again.';
        set({ loading: false, error: errorMsg });
        if (callback) callback({ success: false, message: errorMsg });
        return;
      }
      
      set({ loading: true, error: null });
      
      socket.emit('create-room', config, (response) => {
        set({ loading: false });
        
        if (response.success) {
          const { room } = response;
          set({
            roomCode: room.roomCode,
            roomId: room._id,
            status: 'LOBBY',
            isHost: true,
            gameData: {
              ...get().gameData,
              format: room.format,
              digits: room.digits,
              difficulty: room.difficulty,
            },
            players: {
              me: {
                name: room.host?.username || 'You',
                oderId: room.host?._id || socket.id,
                connected: true,
                ready: false,
              },
              opponent: { name: '', oderId: '', connected: false, ready: false },
            },
          });
        } else {
          set({ error: response.message });
        }
        
        if (callback) callback(response);
      });
    } catch (err) {
      console.error('[OnlineGameStore] createRoom error:', err);
      const errorMsg = err.message || 'Failed to create room';
      set({ loading: false, error: errorMsg });
      if (callback) callback({ success: false, message: errorMsg });
    }
  },
  
  /**
   * Join an existing room by code
   * @param {string} code - Room code
   * @param {Function} callback - Response callback
   */
  joinRoom: (code, callback) => {
    try {
      const socket = getSocket();
      
      if (!socket) {
        const errorMsg = 'Socket not available. Please refresh the page.';
        set({ loading: false, error: errorMsg });
        if (callback) callback({ success: false, message: errorMsg });
        return;
      }
      
      if (!socket.connected) {
        const errorMsg = 'Not connected to server. Reconnecting...';
        set({ loading: false, error: errorMsg });
        socket.connect();
        if (callback) callback({ success: false, message: errorMsg });
        return;
      }
      
      set({ loading: true, error: null });
      
      // Add timeout for the callback
      let callbackCalled = false;
      const timeoutId = setTimeout(() => {
        if (!callbackCalled) {
          callbackCalled = true;
          set({ loading: false, error: 'Request timed out. Please try again.' });
          if (callback) callback({ success: false, message: 'Request timed out. Please try again.' });
        }
      }, 15000); // 15 second timeout
      
      socket.emit('join-room', code, (response) => {
        if (callbackCalled) return; // Already timed out
        callbackCalled = true;
        clearTimeout(timeoutId);
        
        set({ loading: false });
        
        if (response.success) {
          const { room } = response;
          // When joining, we are the opponent in the room data
          // room.opponent._id is our user _id
          // Note: We stay in LOBBY until host clicks Start Game
          set({
            roomCode: room.roomCode,
            roomId: room._id,
            status: 'LOBBY',  // Always LOBBY until host starts game
            isHost: false,
            gameData: {
              ...get().gameData,
              format: room.format,
              digits: room.digits,
              difficulty: room.difficulty,
            },
            players: {
              me: {
                name: room.opponent?.username || 'You',
                oderId: room.opponent?._id || room.opponent,  // Our user _id
                connected: true,
                ready: false,
              },
              opponent: {
                name: room.host?.username || 'Host',
                oderId: room.host?._id || room.host,
                connected: true,
                ready: false,
              },
            },
          });
        } else {
          set({ error: response.message });
        }
        
        if (callback) callback(response);
      });
    } catch (err) {
      console.error('[OnlineGameStore] joinRoom error:', err);
      const errorMsg = err.message || 'Failed to join room';
      set({ loading: false, error: errorMsg });
      if (callback) callback({ success: false, message: errorMsg });
    }
  },
  
  /**
   * Leave current room
   * @param {Function} callback - Response callback
   */
  leaveRoom: (callback) => {
    const socket = getSocket();
    const { roomCode } = get();
    
    if (roomCode) {
      socket.emit('leave-room', roomCode, (response) => {
        if (response.success) {
          get().resetState();
        }
        if (callback) callback(response);
      });
    }
  },

  // ═══════════════════════════════════════════════════════════
  // ACTIONS: GAMEPLAY
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Submit secret number
   * @param {string} secret - Secret number
   * @param {Function} callback - Response callback
   */
  setSecret: (secret, callback) => {
    const socket = getSocket();
    const { roomCode } = get();
    
    socket.emit('submit-secret', { roomCode, secret }, (response) => {
      if (response.success) {
        set((state) => ({
          players: {
            ...state.players,
            me: { ...state.players.me, ready: true },
          },
        }));
      }
      if (callback) callback(response);
    });
  },
  
  /**
   * Submit a guess
   * @param {string} guess - Guess string
   * @param {Function} callback - Response callback
   */
  sendGuess: (guess, callback) => {
    const socket = getSocket();
    const { roomCode } = get();
    
    socket.emit('submit-guess', { roomCode, guess }, (response) => {
      if (callback) callback(response);
    });
  },
  
  /**
   * Request current game state (for reconnection)
   * @param {Function} callback - Response callback
   */
  requestGameState: (callback) => {
    const socket = getSocket();
    const { roomCode, players } = get();
    const myId = players.me.oderId;
    
    socket.emit('game-init', { roomCode }, (response) => {
      if (response.success) {
        const { gameState } = response;
        
        set({
          status: gameState.status,
          gameData: {
            ...get().gameData,
            currentTurnId: gameState.currentTurn,
            turn: gameState.currentTurn === myId ? 'me' : 'opponent',
            roundNumber: gameState.roundNumber,
          },
        });
      }
      if (callback) callback(response);
    });
  },

  // ═══════════════════════════════════════════════════════════
  // SOCKET LISTENERS
  // ═══════════════════════════════════════════════════════════
  
  setupListeners: () => {
    try {
      const socket = getSocket();
      if (!socket) {
        console.warn('[OnlineGameStore] Socket not available for setting up listeners');
        return;
      }
      
      // Player joined the room (host receives this)
      socket.on('player-joined', (data) => {
        set((state) => ({
          players: {
            ...state.players,
            opponent: {
              name: data.opponent.username,
              oderId: data.opponent._id,
              connected: true,
              ready: false,
            },
          },
        }));
      });
      
      // Player left the room
      socket.on('player-left', () => {
        set((state) => ({
          players: {
            ...state.players,
            opponent: { name: '', oderId: '', connected: false, ready: false },
          },
        }));
      });
    
      // Game starting (both players joined)
      socket.on('game-start', (data) => {
        const currentState = get();
      
        // Get current user ID from AUTH STORE (most reliable source)
        const myUserId = getMyUserId();
        
        // Extract IDs from event data
        const hostId = data.host?._id || data.host;
        const opponentId = data.opponent?._id || data.opponent;
        
        // Determine if we're host by comparing with auth user ID
        const amIHost = myUserId === hostId;
        
        set({
          status: 'SETUP',
          roomCode: data.roomCode,
          roomId: data.roomId,
          isHost: amIHost,
          gameData: {
            ...currentState.gameData,
            format: data.format,
            digits: data.digits,
            difficulty: data.difficulty,
            roundNumber: 1,
            scores: { me: 0, opponent: 0 },
          },
          players: {
            me: {
              name: amIHost ? (data.host?.username || 'You') : (data.opponent?.username || 'You'),
              oderId: amIHost ? hostId : opponentId,
              connected: true,
              ready: false,
            },
            opponent: {
              name: amIHost ? (data.opponent?.username || 'Opponent') : (data.host?.username || 'Opponent'),
              oderId: amIHost ? opponentId : hostId,
              connected: true,
              ready: false,
            },
          },
        });
      });
      
      // Opponent submitted their secret
      socket.on('opponent-ready', () => {
        set((state) => ({
          players: {
            ...state.players,
            opponent: { ...state.players.opponent, ready: true },
          },
        }));
      });
      
      // Match starting (both secrets submitted)
      socket.on('match-start', (data) => {
        // Use auth store for reliable user ID
        const myId = getMyUserId() || get().players.me.oderId;
        set({
          status: 'PLAYING',
          gameData: {
            ...get().gameData,
            currentTurnId: data.currentTurn,
            turn: data.currentTurn === myId ? 'me' : 'opponent',
            roundNumber: data.roundNumber,
            timer: data.timerDuration || TIMER_DURATION,
            myLogs: [],
            opponentLogs: [],
          },
        });
      });
      
      // Turn result received
      socket.on('turn-result', (data) => {
        // Use auth store for reliable user ID
        const myId = getMyUserId() || get().players.me.oderId;
        const isMyGuess = data.player === myId;
        
        const logEntry = {
          id: `${data.player}-${Date.now()}`,
          player: isMyGuess ? 'me' : 'opponent',
          guess: data.guess,
          bulls: data.bulls,
          cows: data.cows,
          shit: data.shit,
          timestamp: data.timestamp,
        };
        
        set((state) => ({
          gameData: {
            ...state.gameData,
            currentTurnId: data.nextTurn,
            turn: data.nextTurn === myId ? 'me' : 'opponent',
            timer: TIMER_DURATION, // Reset timer
            myLogs: isMyGuess 
              ? [...state.gameData.myLogs, logEntry] 
              : state.gameData.myLogs,
            opponentLogs: !isMyGuess 
              ? [...state.gameData.opponentLogs, logEntry] 
              : state.gameData.opponentLogs,
          },
        }));
      });
      
      // Timer tick (Hard mode)
      socket.on('timer-tick', (data) => {
        set((state) => ({
          gameData: {
            ...state.gameData,
            timer: data.timeLeft,
          },
        }));
      });
      
      // Turn skipped due to timeout
      socket.on('turn-skipped', (data) => {
        // Use auth store for reliable user ID
        const myId = getMyUserId() || get().players.me.oderId;
        set((state) => ({
          gameData: {
            ...state.gameData,
            currentTurnId: data.nextTurn,
            turn: data.nextTurn === myId ? 'me' : 'opponent',
            timer: TIMER_DURATION,
          },
        }));
      });
      
      // Round over (best-of format)
      // Round over (best-of format) - show round winner screen first
      socket.on('round-over', (data) => {
        // Use auth store for reliable user ID
        const myId = getMyUserId() || get().players.me.oderId;
        const { players } = get();
        const oppId = players.opponent.oderId;
        
        // Calculate scores - try both myId lookup and fallback
        const myScore = data.scores[myId] ?? data.scores[oppId] ?? 0;
        const oppScore = data.scores[oppId] ?? data.scores[myId] ?? 0;
        
        // Determine correct scores by checking if myId exists in scores
        const iAmInScores = myId in data.scores;
        const finalMyScore = iAmInScores ? data.scores[myId] : Object.values(data.scores).find((_, i) => i === 0) || 0;
        const finalOppScore = iAmInScores ? data.scores[oppId] : Object.values(data.scores).find((_, i) => i === 1) || 0;
        
        // More robust: find my score vs opponent's score from the scores object
        const scoreEntries = Object.entries(data.scores);
        let calculatedMyScore = 0;
        let calculatedOppScore = 0;
        
        for (const [oderId, score] of scoreEntries) {
          if (oderId === myId) {
            calculatedMyScore = score;
          } else {
            calculatedOppScore = score;
          }
        }
        
        // First show ROUND_OVER status with winner info
        set({
          status: 'ROUND_OVER',
          roundWinner: data.roundWinner === myId ? 'me' : 'opponent',
          roundWinnerName: data.roundWinnerName,
          gameData: {
            ...get().gameData,
            scores: {
              me: calculatedMyScore,
              opponent: calculatedOppScore,
            },
          },
        });
        
        // After delay, transition to SETUP for next round
        setTimeout(() => {
          set({
            status: 'SETUP',
            roundWinner: null,
            roundWinnerName: null,
            gameData: {
              ...get().gameData,
              currentTurnId: null,
              turn: null,
              myLogs: [],
              opponentLogs: [],
              roundNumber: data.nextRound,
            },
            players: {
              ...get().players,
              me: { ...get().players.me, ready: false },
              opponent: { ...get().players.opponent, ready: false },
            },
          });
        }, 4000);
      });
      
      // Game over
      socket.on('game-over', (data) => {
        // Use auth store for reliable user ID
        const myId = getMyUserId() || get().players.me.oderId;
        const { players } = get();
        const oppId = players.opponent.oderId;
        
        // More robust score calculation from finalScores object
        let calculatedMyScore = 0;
        let calculatedOppScore = 0;
        
        if (data.finalScores) {
          const scoreEntries = Object.entries(data.finalScores);
          for (const [oderId, score] of scoreEntries) {
            if (oderId === myId) {
              calculatedMyScore = score;
            } else {
              calculatedOppScore = score;
            }
          }
        }
        
        set({
          status: 'GAME_OVER',
          winner: data.winner === myId ? 'me' : 'opponent',
          winnerName: data.winnerName,
          gameOverReason: data.reason || 'win',
          gameData: {
            ...get().gameData,
            scores: {
              me: calculatedMyScore,
              opponent: calculatedOppScore,
            },
          },
        });
      });
    } catch (err) {
      console.warn('[OnlineGameStore] Error setting up listeners:', err.message);
    }
  },
  
  removeListeners: () => {
    try {
      const socket = getSocket();
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-start');
      socket.off('opponent-ready');
      socket.off('match-start');
      socket.off('turn-result');
      socket.off('timer-tick');
      socket.off('turn-skipped');
      socket.off('round-over');
      socket.off('game-over');
    } catch {
      // Socket might not be initialized
    }
  },

  // ═══════════════════════════════════════════════════════════
  // UTILITY ACTIONS
  // ═══════════════════════════════════════════════════════════
  
  resetState: () => {
    set({
      roomId: null,
      roomCode: null,
      status: 'IDLE',
      isHost: false,
      players: {
        me: { name: '', oderId: '', connected: false, ready: false },
        opponent: { name: '', oderId: '', connected: false, ready: false },
      },
      gameData: {
        format: 3,
        digits: 4,
        difficulty: 'easy',
        turn: null,
        currentTurnId: null,
        myLogs: [],
        opponentLogs: [],
        timer: TIMER_DURATION,
        roundNumber: 1,
        scores: { me: 0, opponent: 0 },
      },
      winner: null,
      winnerName: null,
      gameOverReason: null,
      roundWinner: null,
      roundWinnerName: null,
      loading: false,
      error: null,
    });
  },
  
  clearError: () => set({ error: null }),
  
  setError: (error) => set({ error }),
}));

export default useOnlineGameStore;
