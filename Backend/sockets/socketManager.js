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

// Socket.io server instance
let io;

// Map: oderId (string) -> socketId (string)
// Used for sending targeted messages to specific users
const userSockets = new Map();

// Active games storage (in-memory for low latency)
// Structure: { roomCode: gameState }
const activeGames = {};

/**
 * Initialize Socket.io server with authentication
 * @param {http.Server} server - HTTP server instance
 * @returns {SocketIO.Server} Socket.io server instance
 */
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
