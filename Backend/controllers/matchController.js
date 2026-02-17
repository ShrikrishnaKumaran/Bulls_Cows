const { emitToUser, isUserOnline } = require('../sockets/socketManager');
const User = require('../models/User');
const { createRoom, joinRoom: joinRoomService, getRoomByCode } = require('../services/roomService');

/**
 * @route   POST /api/match/create
 * @desc    Create a new match room with game settings
 * @access  Private (requires authentication)
 */
exports.createMatch = async (req, res) => {
  try {
    const { format = 3, digits = 4, difficulty = 'easy' } = req.body;
    const userId = req.user._id;

    // Use roomService to create room (handles code generation and uniqueness)
    const room = await createRoom(userId, { format, digits, difficulty });

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

/**
 * @route   POST /api/match/join
 * @desc    Join an existing match room by room code
 * @access  Private (requires authentication)
 */
exports.joinMatch = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user._id;

    // Use roomService to handle join logic
    const room = await joinRoomService(roomCode.toUpperCase(), userId);

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
    // Map service errors to appropriate HTTP status codes
    const statusCode = error.message === 'Room not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   POST /api/match/invite
 * @desc    Send a match invite to a friend via Socket.IO
 * @access  Private (requires authentication, host only)
 */
exports.inviteToMatch = async (req, res) => {
  try {
    const { friendId, roomCode } = req.body;
    const userId = req.user._id;

    // Use roomService to get room
    const room = await getRoomByCode(roomCode.toUpperCase());

    // Validate host permission
    if (room.host._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can send invites'
      });
    }

    // Check if room is full
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

    // Send real-time notification via Socket.IO to all of user's devices
    const friendOnline = isUserOnline(friendId);
    
    if (friendOnline) {
      // Friend is online, send invite notification to all their devices
      emitToUser(friendId, 'match-invite', {
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
      message: friendOnline ? 'Invite sent successfully' : 'Invite sent (friend offline)',
      roomCode: room.roomCode,
      friendOnline: friendOnline
    });
  } catch (error) {
    // Handle room not found from service
    const statusCode = error.message === 'Room not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/match/:roomCode
 * @desc    Get match room details by room code
 * @access  Private (requires authentication)
 */
exports.getMatch = async (req, res) => {
  try {
    const { roomCode } = req.params;

    // Use roomService to get room with populated fields
    const room = await getRoomByCode(roomCode.toUpperCase());

    res.status(200).json({
      success: true,
      matchData: room
    });
  } catch (error) {
    const statusCode = error.message === 'Room not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};
