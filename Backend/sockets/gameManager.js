/**
 * ============================================================
 * Game Manager - Server-Side State Machine
 * ============================================================
 * 
 * Centralized game state management for online 1v1 matches.
 * Handles all game logic: secrets, guessing, timers, scoring.
 * 
 * Architecture:
 * - In-Memory Storage: `games` object for low-latency operations
 * - Server-Authoritative: All game logic validated server-side
 * - Timer Management: Server tracks time, auto-skips on timeout
 * 
 * Game States:
 * - LOBBY: Waiting for opponent
 * - SETUP: Both players entering secrets
 * - PLAYING: Active gameplay
 * - GAME_OVER: Match complete
 */

const { calculateBullsAndCows, validateInput } = require('../utils/gameRules');

// ═══════════════════════════════════════════════════════════
// IN-MEMORY GAME STORAGE
// ═══════════════════════════════════════════════════════════
const games = {};

// Timer references for cleanup
const activeTimers = {};

// Constants
const TIMER_DURATION = 30; // seconds for Hard mode
const TIMER_TICK = 1000; // 1 second

/**
 * Generate a unique room code
 * @returns {string} 6-character alphanumeric code
 */
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Create a new game room
 * @param {string} hostId - Host user ID
 * @param {Object} config - Game configuration
 * @returns {Object} Created game state
 */
const createGame = (hostId, config = {}) => {
  let roomCode = generateRoomCode();
  
  // Ensure unique code
  while (games[roomCode]) {
    roomCode = generateRoomCode();
  }

  const game = {
    roomCode,
    status: 'LOBBY', // LOBBY → SETUP → PLAYING → GAME_OVER
    
    // Players
    host: {
      userId: hostId,
      username: config.hostUsername || 'Player 1',
      socketId: config.hostSocketId || null,
      connected: true,
    },
    opponent: null,
    
    // Configuration
    format: config.format || 3, // Best of 1, 3, or 5
    digits: config.digits || 4, // 3 or 4 digits
    difficulty: config.difficulty || 'easy', // 'easy' or 'hard'
    
    // Game State
    secrets: {}, // { oderId: 'secret' }
    currentTurn: null,
    logs: [],
    
    // Scoring
    roundNumber: 1,
    scores: {}, // { oderId: wins }
    
    // Timer (Hard mode only)
    timer: null,
    timerValue: TIMER_DURATION,
    
    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  games[roomCode] = game;
  return game;
};

/**
 * Join an existing game
 * @param {string} roomCode - Room code
 * @param {string} oderId - Joining user's ID
 * @param {Object} userInfo - User info (username, socketId)
 * @returns {Object} Updated game state
 */
const joinGame = (roomCode, oderId, userInfo = {}) => {
  const game = games[roomCode];
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  if (game.status !== 'LOBBY') {
    throw new Error('Game already in progress');
  }
  
  if (game.host.oderId === oderId) {
    throw new Error('You are already the host');
  }
  
  if (game.opponent) {
    throw new Error('Room is full');
  }

  game.opponent = {
    oderId,
    username: userInfo.username || 'Player 2',
    socketId: userInfo.socketId || null,
    connected: true,
  };
  
  game.status = 'SETUP';
  game.scores[game.host.oderId] = 0;
  game.scores[oderId] = 0;
  game.updatedAt = new Date();
  
  return game;
};

/**
 * Handle secret submission
 * @param {string} roomCode - Room code
 * @param {string} oderId - Player's user ID
 * @param {string} secret - Secret number
 * @returns {Object} { success, bothReady, game }
 */
const handleSecret = (roomCode, oderId, secret) => {
  const game = games[roomCode];
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  if (game.status !== 'SETUP') {
    throw new Error('Not in setup phase');
  }
  
  // Validate player
  const isHost = game.host.oderId === oderId;
  const isOpponent = game.opponent?.oderId === oderId;
  
  if (!isHost && !isOpponent) {
    throw new Error('You are not in this game');
  }
  
  // Validate secret
  const validation = validateInput(secret, game.digits);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  // Prevent resubmission
  if (game.secrets[oderId]) {
    throw new Error('Secret already submitted');
  }
  
  // Store secret
  game.secrets[oderId] = secret;
  game.updatedAt = new Date();
  
  // Check if both players ready
  const hostReady = !!game.secrets[game.host.oderId];
  const opponentReady = !!game.secrets[game.opponent.oderId];
  const bothReady = hostReady && opponentReady;
  
  if (bothReady) {
    // Start the game!
    game.status = 'PLAYING';
    
    // Randomly select first player
    const players = [game.host.oderId, game.opponent.oderId];
    game.currentTurn = players[Math.floor(Math.random() * 2)];
  }
  
  return { success: true, bothReady, game };
};

/**
 * Process a guess
 * @param {string} roomCode - Room code
 * @param {string} oderId - Guessing player's ID
 * @param {string} guess - The guess
 * @param {string} playerName - Player's username
 * @returns {Object} { result, isWin, isRoundOver, isGameOver, game }
 */
const processGuess = (roomCode, oderId, guess, playerName) => {
  const game = games[roomCode];
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  if (game.status !== 'PLAYING') {
    throw new Error('Game is not in playing state');
  }
  
  if (game.currentTurn !== oderId) {
    throw new Error('Not your turn');
  }
  
  // Validate guess
  const validation = validateInput(guess, game.digits);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  // Get opponent's secret
  const opponentId = game.host.oderId === oderId 
    ? game.opponent.oderId 
    : game.host.oderId;
  const opponentSecret = game.secrets[opponentId];
  
  // Calculate result
  const result = calculateBullsAndCows(opponentSecret, guess, game.digits);
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  // Log the guess
  const logEntry = {
    player: oderId,
    playerName,
    guess,
    bulls: result.bulls,
    cows: result.cows,
    shit: result.shit,
    timestamp: new Date(),
    turnNumber: game.logs.length + 1,
  };
  game.logs.push(logEntry);
  
  // Switch turn
  game.currentTurn = opponentId;
  game.updatedAt = new Date();
  
  // Check win condition
  let isRoundOver = false;
  let isGameOver = false;
  
  if (result.isWin) {
    game.scores[oderId] = (game.scores[oderId] || 0) + 1;
    
    const winsNeeded = Math.ceil(game.format / 2);
    
    if (game.scores[oderId] >= winsNeeded) {
      // Match won!
      game.status = 'GAME_OVER';
      game.winner = oderId;
      game.winnerName = playerName;
      isGameOver = true;
      
      // Stop any active timer
      stopTimer(roomCode);
      
    } else {
      // Round won, continue to next round
      isRoundOver = true;
      game.roundNumber += 1;
      game.status = 'SETUP';
      game.secrets = {};
      game.logs = [];
      game.currentTurn = null;
      
      // Stop timer for setup phase
      stopTimer(roomCode);
    }
  }
  
  return {
    result: logEntry,
    isWin: result.isWin,
    isRoundOver,
    isGameOver,
    game,
  };
};

/**
 * Skip current player's turn (called on timeout)
 * @param {string} roomCode - Room code
 * @param {Object} gameRef - Optional game object reference (for external games)
 * @returns {Object} { nextTurn, game }
 */
const skipTurn = (roomCode, gameRef = null) => {
  // Use provided game reference or look up from internal storage
  const game = gameRef || games[roomCode];
  
  if (!game || game.status !== 'PLAYING') {
    return null;
  }
  
  const skippedPlayer = game.currentTurn;
  
  // Switch to other player
  game.currentTurn = game.host.oderId === skippedPlayer
    ? game.opponent.oderId
    : game.host.oderId;
  
  game.updatedAt = new Date();
  
  return { skippedPlayer, nextTurn: game.currentTurn, game };
};

/**
 * Handle player disconnect
 * @param {string} oderId - Disconnected user's ID
 * @returns {Object|null} Affected game info or null
 */
const handleDisconnect = (oderId) => {
  // Find game with this player
  for (const roomCode in games) {
    const game = games[roomCode];
    
    if (game.status === 'GAME_OVER') continue;
    
    const isHost = game.host.oderId === oderId;
    const isOpponent = game.opponent?.oderId === oderId;
    
    if (isHost || isOpponent) {
      if (isHost) {
        game.host.connected = false;
      } else {
        game.opponent.connected = false;
      }
      
      // If in active game, opponent wins
      if (game.status === 'PLAYING' || game.status === 'SETUP') {
        game.status = 'GAME_OVER';
        game.winner = isHost ? game.opponent?.oderId : game.host.oderId;
        game.winnerName = isHost ? game.opponent?.username : game.host.username;
        game.disconnectedPlayer = oderId;
        
        stopTimer(roomCode);
        
        return {
          roomCode,
          winner: game.winner,
          winnerName: game.winnerName,
          reason: 'disconnect',
          game,
        };
      }
      
      // If in lobby, just remove the player
      if (game.status === 'LOBBY') {
        delete games[roomCode];
        return { roomCode, deleted: true };
      }
    }
  }
  
  return null;
};

/**
 * Start turn timer (Hard mode)
 * @param {string} roomCode - Room code
 * @param {Function} onTick - Called each second with remaining time
 * @param {Function} onTimeout - Called when timer expires
 * @param {Object} gameRef - Optional game object reference (for external games)
 */
const startTimer = (roomCode, onTick, onTimeout, gameRef = null) => {
  // Use provided game reference or look up from internal storage
  const game = gameRef || games[roomCode];
  
  if (!game || game.difficulty !== 'hard') {
    return;
  }
  
  // Clear existing timer
  stopTimer(roomCode);
  
  // Initialize timer value on the game object
  game.timerValue = TIMER_DURATION;
  
  activeTimers[roomCode] = setInterval(() => {
    game.timerValue -= 1;
    
    if (onTick) {
      onTick(game.timerValue);
    }
    
    if (game.timerValue <= 0) {
      stopTimer(roomCode);
      if (onTimeout) {
        onTimeout();
      }
    }
  }, TIMER_TICK);
};

/**
 * Stop turn timer
 * @param {string} roomCode - Room code
 */
const stopTimer = (roomCode) => {
  if (activeTimers[roomCode]) {
    clearInterval(activeTimers[roomCode]);
    delete activeTimers[roomCode];
  }
  
  const game = games[roomCode];
  if (game) {
    game.timerValue = TIMER_DURATION;
  }
};

/**
 * Reset timer (on turn change)
 * @param {string} roomCode - Room code
 */
const resetTimer = (roomCode) => {
  const game = games[roomCode];
  if (game) {
    game.timerValue = TIMER_DURATION;
  }
};

/**
 * Get game by room code
 * @param {string} roomCode - Room code
 * @returns {Object|null} Game state
 */
const getGame = (roomCode) => {
  return games[roomCode] || null;
};

/**
 * Get game state without secrets (safe for client)
 * @param {string} roomCode - Room code
 * @param {string} requestingUserId - ID of user requesting
 * @returns {Object} Sanitized game state
 */
const getPublicGameState = (roomCode, requestingUserId) => {
  const game = games[roomCode];
  
  if (!game) {
    return null;
  }
  
  return {
    roomCode: game.roomCode,
    status: game.status,
    format: game.format,
    digits: game.digits,
    difficulty: game.difficulty,
    host: {
      oderId: game.host.oderId,
      username: game.host.username,
      connected: game.host.connected,
    },
    opponent: game.opponent ? {
      oderId: game.opponent.oderId,
      username: game.opponent.username,
      connected: game.opponent.connected,
    } : null,
    currentTurn: game.currentTurn,
    logs: game.logs,
    roundNumber: game.roundNumber,
    scores: game.scores,
    timerValue: game.timerValue,
    hostReady: !!game.secrets[game.host.oderId],
    opponentReady: game.opponent ? !!game.secrets[game.opponent.oderId] : false,
    winner: game.winner,
    winnerName: game.winnerName,
  };
};

/**
 * Delete a game
 * @param {string} roomCode - Room code
 */
const deleteGame = (roomCode) => {
  stopTimer(roomCode);
  delete games[roomCode];
};

/**
 * Get all active games (for debugging)
 * @returns {Object} All games
 */
const getAllGames = () => {
  return games;
};

module.exports = {
  createGame,
  joinGame,
  handleSecret,
  processGuess,
  skipTurn,
  handleDisconnect,
  startTimer,
  stopTimer,
  resetTimer,
  getGame,
  getPublicGameState,
  deleteGame,
  getAllGames,
  TIMER_DURATION,
};
