const roomService = require('../services/roomService');
const { stopTimer } = require('./timerManager');

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
        guessCounter: 0, // For ordering guesses correctly
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
        stopTimer(roomCode);
        
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
      
      // Check if host left in LOBBY state - close room and kick opponent
      if (game && game.host.oderId === leavingUserId) {
        // Host left - notify opponent to go home
        socket.to(roomCode).emit('room-closed', {
          reason: 'host_left',
          message: 'Host has left the room',
        });
      } else if (!result.deleted && (!game || game.status === 'LOBBY')) {
        // Opponent left in lobby - notify host
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

  // ─────────────────────────────────────────────────────────────
  // EVENT: send-game-invite
  // Send a game invitation to a friend
  // Data: { friendId, roomCode }
  // ─────────────────────────────────────────────────────────────
  socket.on('send-game-invite', async (data, callback) => {
    const { friendId, roomCode } = data;
    
    console.log('[Lobby] Send invite request:', { friendId, roomCode, from: socket.user.username });
    
    try {
      // Get the friend's socket ID to send them the invite
      const friendSocketId = getUserSocketId(friendId);
      
      console.log('[Lobby] Friend socket ID:', friendSocketId);
      
      if (!friendSocketId) {
        console.log('[Lobby] Friend is offline - no socket ID found');
        return callback({ 
          success: false, 
          message: 'Friend is offline' 
        });
      }
      
      // Get room info to include in invite
      const room = await roomService.getRoomByCode(roomCode);
      if (!room) {
        return callback({ 
          success: false, 
          message: 'Room not found' 
        });
      }
      
      // Send invite directly to friend's socket
      console.log('[Lobby] Emitting game-invite to socket:', friendSocketId);
      io.to(friendSocketId).emit('game-invite', {
        from: {
          _id: socket.user._id,
          username: socket.user.username,
        },
        roomCode: roomCode,
        format: room.format,
        digits: room.digits,
        difficulty: room.difficulty,
        timestamp: new Date(),
      });
      
      console.log('[Lobby] Invite emitted successfully');
      callback({ success: true, message: 'Invite sent' });
    } catch (error) {
      console.error('[Lobby] Send invite error:', error.message);
      callback({ success: false, message: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT: decline-game-invite
  // Notify inviter that invite was declined
  // ─────────────────────────────────────────────────────────────
  socket.on('decline-game-invite', async (data) => {
    const { inviterId } = data;
    
    const inviterSocketId = getUserSocketId(inviterId);
    if (inviterSocketId) {
      io.to(inviterSocketId).emit('invite-declined', {
        by: {
          _id: socket.user._id,
          username: socket.user.username,
        },
      });
    }
  });
};
