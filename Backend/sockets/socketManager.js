/**
 * ============================================================
 * Socket Manager - WebSocket Server Configuration
 * ============================================================
 * 
 * Manages Socket.io server initialization and authentication:
 * - CORS configuration for frontend communication
 * - JWT-based authentication middleware
 * - User-socket mapping for targeted messaging
 * - Handler registration (lobby, game)
 * 
 * Exports:
 * - initializeSocket(server): Start the WebSocket server
 * - getIO(): Get the Socket.io instance
 * - getUserSocketId(userId): Get socket ID for a user
 * - getActiveGames(): Get active games storage
 */

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const lobbyHandler = require('./lobbyHandler');
const gameHandler = require('./gameHandler');
const gameManager = require('./gameManager');

// Socket.io server instance
let io;

// Map: oderId (string) -> socketId (string)
// Used for sending targeted messages to specific users
const userSockets = new Map();

// Active games storage (in-memory for low latency)
// Structure: { roomCode: gameState }
const activeGames = {};

// Get allowed origins for Socket.io CORS
const getAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return clientUrl.split(',').map(url => url.trim());
};

/**
 * Initialize Socket.io server with authentication
 * @param {http.Server} server - HTTP server instance
 * @returns {SocketIO.Server} Socket.io server instance
 */
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: function(origin, callback) {
        // Allow requests with no origin
        if (!origin) return callback(null, true);
        
        // In development, allow all origins
        if (process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        
        // In production, check against allowed origins
        const allowedOrigins = getAllowedOrigins();
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log(`Socket CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ─────────────────────────────────────────────────────────────
  // Authentication Middleware
  // Validates JWT before allowing socket connection
  // ─────────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket for use in handlers
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // ─────────────────────────────────────────────────────────────
  // Connection Handler
  // ─────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const oderId = socket.user._id.toString();
    
    // Track user's socket connection
    userSockets.set(oderId, socket.id);
    console.log(`[Socket] User ${socket.user.username} connected (ID: ${socket.id})`);

    // Register event handlers
    lobbyHandler(io, socket, activeGames, getUserSocketId);
    gameHandler(io, socket, activeGames);

    // Handle disconnection
    socket.on('disconnect', () => {
      userSockets.delete(oderId);
      console.log(`[Socket] User ${socket.user.username} disconnected`);
      
      // Check activeGames for any game this user is in
      for (const roomCode in activeGames) {
        const game = activeGames[roomCode];
        
        if (game.status === 'GAME_OVER') continue;
        
        const isHost = game.host.oderId === oderId;
        const isOpponent = game.opponent?.oderId === oderId;
        
        if (isHost || isOpponent) {
          // Player was in an active game - opponent wins
          if (game.status === 'PLAYING' || game.status === 'SETUP') {
            const winnerId = isHost ? game.opponent.oderId : game.host.oderId;
            const winnerName = isHost ? 'Opponent' : socket.user.username;
            
            // Stop any running timer
            gameManager.stopTimer(roomCode);
            
            // Mark game as over
            game.status = 'GAME_OVER';
            
            // Notify remaining player they won
            io.to(roomCode).emit('game-over', {
              winner: winnerId,
              winnerName: isHost ? 'You' : winnerName,
              reason: 'disconnect',
              message: `${socket.user.username} disconnected. You win!`,
              finalScores: game.scores || { [game.host.oderId]: 0, [game.opponent.oderId]: 0 },
              hostId: game.host.oderId,
              opponentId: game.opponent.oderId,
            });
            
            console.log(`[Socket] Player ${socket.user.username} disconnected from game ${roomCode}, ${winnerId} wins`);
            
            // Cleanup game after 1 minute
            setTimeout(() => {
              delete activeGames[roomCode];
            }, 60000);
          }
          break;
        }
      }
    });
  });

  return io;
};

/**
 * Get the Socket.io server instance
 * @returns {SocketIO.Server}
 * @throws {Error} If socket not initialized
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Get socket ID for a specific user
 * @param {string} oderId - User ID
 * @returns {string|undefined} Socket ID or undefined if user offline
 */
const getUserSocketId = (oderId) => {
  return userSockets.get(oderId.toString());
};

/**
 * Get active games storage
 * @returns {Object} Active games object
 */
const getActiveGames = () => {
  return activeGames;
};

module.exports = {
  initializeSocket,
  getIO,
  getUserSocketId,
  getActiveGames,
};
