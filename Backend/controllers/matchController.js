const Room = require('../models/Room');

// Helper function to generate random 4-character room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new match room
exports.createMatch = async (req, res) => {
  try {
    const { format = 3, difficulty = 'easy' } = req.body;
    const userId = req.user._id;

    // Validate format
    if (![1, 3, 5].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Must be 1, 3, or 5'
      });
    }

    // Generate unique room code
    let roomCode;
    let exists = true;
    while (exists) {
      roomCode = generateRoomCode();
      exists = await Room.findOne({ roomCode });
    }

    const room = new Room({
      roomCode,
      host: userId,
      players: [userId],
      playerCount: 1,
      format,
      difficulty,
      mode: 'online',
      status: 'waiting'
    });

    await room.save();

    res.status(201).json({
      success: true,
      roomCode: room.roomCode,
      roomId: room._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create match',
      error: error.message
    });
  }
};

// Join an existing match room
exports.joinMatch = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user._id;

    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.host.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot join your own room'
      });
    }

    if (room.playerCount >= 2) {
      return res.status(400).json({
        success: false,
        message: 'Room is already full'
      });
    }

    room.players.push(userId);
    room.playerCount = room.players.length;
    room.status = 'active';
    await room.save();

    await room.populate('host', 'username');
    await room.populate('players', 'username');

    res.status(200).json({
      success: true,
      matchData: {
        roomCode: room.roomCode,
        host: room.host,
        players: room.players,
        format: room.format,
        digits: room.digits,
        difficulty: room.difficulty
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to join match',
      error: error.message
    });
  }
};

// Invite a friend to match
exports.inviteToMatch = async (req, res) => {
  try {
    const { friendId, roomCode } = req.body;
    const userId = req.user._id;

    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.host.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can send invites'
      });
    }

    if (room.playerCount >= 2) {
      return res.status(400).json({
        success: false,
        message: 'Room is already full'
      });
    }

    // TODO: Implement WebSocket notification to friendId
    // For now, just return success
    // In future: Send real-time notification via Socket.IO

    res.status(200).json({
      success: true,
      message: 'Invite sent successfully',
      roomCode: room.roomCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send invite',
      error: error.message
    });
  }
};

// Get match details
exports.getMatch = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() })
      .populate('host', 'username')
      .populate('players', 'username');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      matchData: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get match',
      error: error.message
    });
  }
};
