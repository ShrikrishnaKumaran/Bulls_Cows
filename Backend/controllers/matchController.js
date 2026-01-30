const Room = require('../models/Room');
const { getIO, getUserSocketId } = require('../sockets/socketManager');
const User = require('../models/User');

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
    const { format = 3, digits = 4, difficulty = 'easy' } = req.body;
    const userId = req.user._id;

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
      opponent: null,
      format,
      digits,
      difficulty,
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

    if (room.opponent) {
      return res.status(400).json({
        success: false,
        message: 'Room is already full'
      });
    }

    room.opponent = userId;
    room.status = 'active';
    await room.save();

    await room.populate('host', 'username');
    await room.populate('opponent', 'username');

    res.status(200).json({
      success: true,
      matchData: {
        roomCode: room.roomCode,
        host: room.host,
        opponent: room.opponent,
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

    if (room.opponent) {
      return res.status(400).json({
        success: false,
        message: 'Room is already full'
      });
    }

    // Verify friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'Friend not found'
      });
    }

    // Send real-time notification via Socket.IO
    const io = getIO();
    const friendSocketId = getUserSocketId(friendId);
    
    if (friendSocketId) {
      // Friend is online, send invite notification
      io.to(friendSocketId).emit('match-invite', {
        roomCode: room.roomCode,
        host: {
          _id: userId,
          username: req.user.username
        },
        format: room.format,
        digits: room.digits,
        difficulty: room.difficulty
      });
    }

    res.status(200).json({
      success: true,
      message: friendSocketId ? 'Invite sent successfully' : 'Invite sent (friend offline)',
      roomCode: room.roomCode,
      friendOnline: !!friendSocketId
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
      .populate('opponent', 'username');

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
