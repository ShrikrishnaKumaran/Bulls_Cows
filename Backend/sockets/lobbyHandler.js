const roomService = require('../services/roomService');

module.exports = (io, socket) => {
  // Create a new room
  socket.on('create-room', async (settings, callback) => {
    try {
      const room = await roomService.createRoom(socket.user._id, settings);
      
      // Join the socket room
      socket.join(room.roomCode);
      
      callback({
        success: true,
        room: {
          roomCode: room.roomCode,
          host: room.host,
          players: room.players,
          playerCount: room.playerCount,
          format: room.format,
          digits: room.digits,
          difficulty: room.difficulty,
          status: room.status,
        },
      });
    } catch (error) {
      callback({
        success: false,
        message: error.message,
      });
    }
  });

  // Join an existing room
  socket.on('join-room', async (roomCode, callback) => {
    try {
      const room = await roomService.joinRoom(roomCode, socket.user._id);
      
      // Join the socket room
      socket.join(roomCode);
      
      // Notify other players in the room
      socket.to(roomCode).emit('player-joined', {
        player: {
          _id: socket.user._id,
          username: socket.user.username,
        },
        players: room.players,
        playerCount: room.playerCount,
      });

      callback({
        success: true,
        room,
      });

      // Start game if room is active (full)
      if (room.status === 'active') {
        io.to(roomCode).emit('game-start', {
          roomId: room._id,
          roomCode: room.roomCode,
          mode: room.mode,
          format: room.format,
          digits: room.digits,
          difficulty: room.difficulty,
          players: room.players,
        });
      }
    } catch (error) {
      callback({
        success: false,
        message: error.message,
      });
    }
  });

  // Leave room
  socket.on('leave-room', async (roomCode, callback) => {
    try {
      const result = await roomService.leaveRoom(roomCode, socket.user._id);
      
      // Leave the socket room
      socket.leave(roomCode);
      
      // Notify other players
      if (!result.deleted) {
        socket.to(roomCode).emit('player-left', {
          playerId: socket.user._id,
          players: result.players,
        });
      }

      callback({
        success: true,
      });
    } catch (error) {
      callback({
        success: false,
        message: error.message,
      });
    }
  });

  // Get room info
  socket.on('get-room', async (roomCode, callback) => {
    try {
      const room = await roomService.getRoomByCode(roomCode);
      
      callback({
        success: true,
        room,
      });
    } catch (error) {
      callback({
        success: false,
        message: error.message,
      });
    }
  });

  // Send chat message in room
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

  // Player ready status
  socket.on('player-ready', (roomCode) => {
    socket.to(roomCode).emit('player-ready', {
      playerId: socket.user._id,
    });
  });
};
