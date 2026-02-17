const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const lobbyHandler = require('./lobbyHandler');
const gameHandler = require('./gameHandler');
const { stopTimer } = require('./timerManager');

// Socket.io server instance
let io;

// Map: userId (string) -> Set of socketIds (for multiple tabs/devices)
// Used for sending targeted messages to specific users
const userSockets = new Map();

// Active games storage (in-memory for low latency)
// Structure: { roomCode: gameState }
const activeGames = {};

// Get allowed origins for Socket.io CORS (from CLIENT_URL env var)
const getAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return clientUrl.split(',').map(url => url.trim());
};

/**
 * Reset all users to offline on server start
 * Handles stale online status from server restarts/crashes
 */
const resetAllUsersOffline = async () => {
  try {
    await User.updateMany({}, { isOnline: false });
    console.log('[Socket] Reset all users to offline on server start');
  } catch (err) {
    console.error('[Socket] Failed to reset online status:', err.message);
  }
};

/**
 * Initialize Socket.io server with authentication
 * @param {http.Server} server - HTTP server instance
 * @returns {SocketIO.Server} Socket.io server instance
 */
const initializeSocket = (server) => {
  // Reset all users to offline when server starts
  resetAllUsersOffline();
  
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
  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    
    // Track user's socket connection (supports multiple tabs/devices)
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    
    const connectionCount = userSockets.get(userId).size;
    console.log('[Socket] User connected:', socket.user.username, 'ID:', userId, 'SocketID:', socket.id, 'Connections:', connectionCount);
    
    // Update user's online status in database (only if first connection)
    if (connectionCount === 1) {
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
        console.log('[Socket] Marked user online:', socket.user.username);
      } catch (err) {
        console.error('[Socket] Failed to update online status:', err.message);
      }
    }

    // Register event handlers
    lobbyHandler(io, socket, activeGames, getUserSocketId, emitToUser, isUserOnline);
    gameHandler(io, socket, activeGames);

    // Handle disconnection
    socket.on('disconnect', async () => {
      // Remove this socket from user's connection set
      const socketSet = userSockets.get(userId);
      if (socketSet) {
        socketSet.delete(socket.id);
        
        // Only mark offline if ALL connections are closed
        if (socketSet.size === 0) {
          userSockets.delete(userId);
          try {
            await User.findByIdAndUpdate(userId, { isOnline: false });
            console.log('[Socket] Marked user offline:', socket.user.username);
          } catch (err) {
            console.error('[Socket] Failed to update offline status:', err.message);
          }
        } else {
          console.log('[Socket] User still has', socketSet.size, 'connections:', socket.user.username);
        }
      }
      
      // Check activeGames for any game this user is in
      for (const roomCode in activeGames) {
        const game = activeGames[roomCode];
        
        if (game.status === 'GAME_OVER') continue;
        
        const isHost = game.host.oderId === userId;
        const isOpponent = game.opponent?.oderId === userId;
        
        if (isHost || isOpponent) {
          // Check if user still has other connections (don't end game if reconnecting)
          if (userSockets.has(userId) && userSockets.get(userId).size > 0) {
            continue;
          }
          
          // Player was in an active game - opponent wins
          if (game.status === 'PLAYING' || game.status === 'SETUP') {
            const winnerId = isHost ? game.opponent.oderId : game.host.oderId;
            const winnerName = isHost ? 'Opponent' : socket.user.username;
            
            // Stop any running timer
            stopTimer(roomCode);
            
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
 * Returns the first available socket ID if user has multiple connections
 * @param {string} oderId - User ID
 * @returns {string|undefined} Socket ID or undefined if user offline
 */
const getUserSocketId = (oderId) => {
  const id = oderId.toString();
  const socketSet = userSockets.get(id);
  
  if (!socketSet || socketSet.size === 0) {
    console.log('[Socket] getUserSocketId: User offline:', id);
    return undefined;
  }
  
  // Return first socket ID from the set
  const socketId = socketSet.values().next().value;
  console.log('[Socket] getUserSocketId:', id, '-> Found:', socketId, '(', socketSet.size, 'connections)');
  return socketId;
};

/**
 * Emit an event to all sockets of a specific user
 * Use this for notifications that should reach all tabs/devices
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const emitToUser = (userId, event, data) => {
  const id = userId.toString();
  const socketSet = userSockets.get(id);
  
  if (!socketSet || socketSet.size === 0) {
    console.log('[Socket] emitToUser: User offline:', id);
    return;
  }
  
  // Emit to all of user's sockets
  socketSet.forEach(socketId => {
    io.to(socketId).emit(event, data);
  });
  console.log('[Socket] Emitted', event, 'to', socketSet.size, 'sockets for user:', id);
};

/**
 * Check if a user is currently online (connected via socket)
 * @param {string} userId - User ID
 * @returns {boolean} True if user has at least one socket connection
 */
const isUserOnline = (userId) => {
  const id = userId.toString();
  const socketSet = userSockets.get(id);
  return socketSet && socketSet.size > 0;
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
  emitToUser,
  isUserOnline,
  getActiveGames,
};
