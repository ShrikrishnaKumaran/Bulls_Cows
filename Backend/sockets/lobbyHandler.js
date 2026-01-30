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
      callback({ success: false, message: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT: join-room
  // Join an existing room as opponent
  // Triggers game-start if room becomes full
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

      // If room is now active (2 players), initialize the game
      if (room.status === 'active') {
        const hostId = room.host.toString();
        const opponentId = socket.user._id.toString();
        
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
            [hostId]: getUserSocketId(hostId),
            [opponentId]: socket.id,
          },
        };
        
        // Ensure host socket is also in the room
        const hostSocketId = getUserSocketId(hostId);
        if (hostSocketId) {
          const hostSocket = io.sockets.sockets.get(hostSocketId);
          if (hostSocket) {
            hostSocket.join(roomCode);
          }
        }

        // Notify both players that game is starting
        io.to(roomCode).emit('game-start', {
          roomId: room._id,
          roomCode: room.roomCode,
          format: room.format,
          digits: room.digits,
          difficulty: room.difficulty,
          host: room.host,
          opponent: room.opponent,
        });
      }
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT: leave-room
  // Leave the room (deletes room if host leaves)
  // ─────────────────────────────────────────────────────────────
  socket.on('leave-room', async (roomCode, callback) => {
    try {
      const result = await roomService.leaveRoom(roomCode, socket.user._id);
      
      // Leave the socket.io room
      socket.leave(roomCode);
      
      // Notify others if room still exists
      if (!result.deleted) {
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
  // ─────────────────────────────────────────────────────────────
  socket.on('get-room', async (roomCode, callback) => {
    try {
      const room = await roomService.getRoomByCode(roomCode);
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
