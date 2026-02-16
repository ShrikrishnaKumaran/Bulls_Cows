/**
 * ============================================================
 * Lobby Handler - Room Management via Socket.io
 * ============================================================
 * 
 * Manages game room operations:
 * - Creating rooms with custom settings
 * - Joining rooms by code
 * - Leaving rooms (cleanup)
 * - Getting room information
 * - In-room chat messaging
 * 
 * Socket Events Handled:
 * - create-room: Host creates a new game room
 * - join-room: Player joins an existing room
 * - leave-room: Player leaves the room
 * - get-room: Get room details
 * - room-message: Chat within the room
 * - player-ready: Signal ready status
 */

const roomService = require('../services/roomService');
const gameManager = require('./gameManager');

/**
 * Initialize lobby handler for a socket connection
 * @param {SocketIO.Server} io - Socket.io server instance
 * @param {SocketIO.Socket} socket - Connected client socket
 * @param {Object} activeGames - In-memory game state storage
 * @param {Function} getUserSocketId - Function to get socket ID by user ID
 */
module.exports = (io, socket, activeGames, getUserSocketId) => {
  
  // ─────────────────────────────────────────────────────────────
  // EVENT: create-room
  // Creates a new room and makes the creator the host
  // ─────────────────────────────────────────────────────────────
  socket.on('create-room', async (settings, callback) => {
    try {
      const room = await roomService.createRoom(socket.user._id, settings);
      
      // Join the socket.io room for real-time updates
      socket.join(room.roomCode);
      
      callback({
        success: true,
        room: {
          roomCode: room.roomCode,
          host: room.host,
          opponent: room.opponent,
          format: room.format,
          digits: room.digits,
          difficulty: room.difficulty,
          status: room.status,
        },
      });
    } catch (error) {
      console.error('[Lobby] Create room error:', error.message);
      callback({ success: false, message: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT: join-room
  // Join an existing room as opponent
  // Does NOT auto-start - host must click Start Game
  // ─────────────────────────────────────────────────────────────
  socket.on('join-room', async (roomCode, callback) => {
    try {
      const room = await roomService.joinRoom(roomCode, socket.user._id);
      
      // Join the socket.io room
      socket.join(roomCode);
      
      // Notify host that opponent joined
      socket.to(roomCode).emit('player-joined', {
        opponent: {
          _id: socket.user._id,
          username: socket.user.username,
        },
      });

      callback({ success: true, room });
      
      // Note: Game does NOT auto-start here anymore
      // Host must click "Start Game" which triggers the 'start-game' event
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT: start-game
  // Host initiates the game start after opponent has joined
  // ─────────────────────────────────────────────────────────────
  socket.on('start-game', async (roomCode, callback) => {
    try {
      const room = await roomService.getRoomByCode(roomCode);
      
      // Verify the requester is the host
      const hostId = room.host._id ? room.host._id.toString() : room.host.toString();
      if (hostId !== socket.user._id.toString()) {
        return callback({ success: false, message: 'Only the host can start the game' });
      }
      
      // Verify opponent has joined
      if (!room.opponent) {
        return callback({ success: false, message: 'Waiting for opponent to join' });
      }
      
      const opponentId = room.opponent._id ? room.opponent._id.toString() : room.opponent.toString();
      
      // Initialize game state in memory
      activeGames[roomCode] = {
        roomCode,
        host: { oderId: hostId },
        opponent: { oderId: opponentId },
        format: room.format,
        digits: room.digits,
        difficulty: room.difficulty,
        status: 'SETUP', // Waiting for secrets
        secrets: {},
        currentTurn: null,
        logs: [],
        roundNumber: 1,
        scores: { [hostId]: 0, [opponentId]: 0 },
        playerSockets: {
          [hostId]: socket.id,
          [opponentId]: getUserSocketId(opponentId),
        },
      };
      
      // Ensure both sockets are in the room
      const opponentSocketId = getUserSocketId(opponentId);
      
      if (opponentSocketId) {
        const opponentSocket = io.sockets.sockets.get(opponentSocketId);
        if (opponentSocket) {
          opponentSocket.join(roomCode);
        }
      }

      // Notify both players that game is starting
      const gameStartPayload = {
        roomId: room._id,
        roomCode: room.roomCode,
        format: room.format,
        digits: room.digits,
        difficulty: room.difficulty,
        host: room.host,
        opponent: room.opponent,
      };
      
      io.to(roomCode).emit('game-start', gameStartPayload);
      
      callback({ success: true });
    } catch (error) {
      console.error('[Lobby] Start game error:', error.message);
      callback({ success: false, message: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT: leave-room
  // Leave the room - if game is active, opponent wins!
  // ─────────────────────────────────────────────────────────────
  socket.on('leave-room', async (roomCode, callback) => {
    try {
      const leavingUserId = socket.user._id.toString();
      const game = activeGames[roomCode];
      
      // If there's an active game (SETUP or PLAYING), the opponent wins
      if (game && (game.status === 'SETUP' || game.status === 'PLAYING')) {
        const isHost = game.host.oderId === leavingUserId;
        const winnerId = isHost ? game.opponent.oderId : game.host.oderId;
        
        // Stop any running timer
        gameManager.stopTimer(roomCode);
        
        // Notify the opponent that they won
        socket.to(roomCode).emit('game-over', {
          winner: winnerId,
          winnerName: isHost ? 'Opponent' : 'You',
          reason: 'opponent_quit',
          finalScores: game.scores || { [game.host.oderId]: 0, [game.opponent.oderId]: 0 },
          hostId: game.host.oderId,
          opponentId: game.opponent.oderId,
        });
      }
      
      const result = await roomService.leaveRoom(roomCode, socket.user._id);
      
      // Leave the socket.io room
      socket.leave(roomCode);
      
      // Notify others if room still exists (lobby state)
      if (!result.deleted && (!game || game.status === 'LOBBY')) {
        socket.to(roomCode).emit('player-left', {
          oderId: socket.user._id,
        });
      }

      // Clean up active game if exists
      if (activeGames[roomCode]) {
        delete activeGames[roomCode];
      }

      callback({ success: true });
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT: get-room
  // Get room information by code
  // Also ensures the socket joins the room (for reconnection cases)
  // ─────────────────────────────────────────────────────────────
  socket.on('get-room', async (roomCode, callback) => {
    try {
      const room = await roomService.getRoomByCode(roomCode);
      
      // Ensure socket joins the room (important for reconnection)
      socket.join(roomCode);
      
      callback({ success: true, room });
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT: room-message
  // Send chat message to all players in room
  // ─────────────────────────────────────────────────────────────
  socket.on('room-message', (data) => {
    const { roomCode, message } = data;
    
    io.to(roomCode).emit('room-message', {
      sender: {
        _id: socket.user._id,
        username: socket.user.username,
      },
      message,
      timestamp: new Date(),
    });
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT: player-ready
  // Signal that player is ready (UI feedback only)
  // ─────────────────────────────────────────────────────────────
  socket.on('player-ready', (roomCode) => {
    socket.to(roomCode).emit('player-ready', {
      oderId: socket.user._id,
    });
  });
};
