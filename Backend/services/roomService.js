const Room = require('../models/Room');

// Generate unique room code (4 characters)
const generateRoomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Create a new room
const createRoom = async (hostId, settings = {}) => {
  const roomCode = generateRoomCode();

  // Check if room code already exists
  const existingRoom = await Room.findOne({ roomCode });
  if (existingRoom) {
    // Recursively generate a new code
    return createRoom(hostId, settings);
  }

  const room = await Room.create({
    roomCode,
    host: hostId,
    opponent: null,
    format: settings.format || 3,
    digits: settings.digits || 4,
    difficulty: settings.difficulty || 'easy',
    status: 'waiting'
  });

  // Return populated room
  const populatedRoom = await Room.findById(room._id)
    .populate('host', 'username _id');
    
  return populatedRoom;
};

// Join an existing room
const joinRoom = async (roomCode, playerId) => {
  const room = await Room.findOne({ roomCode });

  if (!room) {
    throw new Error('Room not found');
  }

  if (room.status !== 'waiting') {
    throw new Error('Room is not available');
  }

  if (room.opponent) {
    throw new Error('Room is full');
  }

  if (room.host.toString() === playerId.toString()) {
    throw new Error('You cannot join your own room');
  }

  room.opponent = playerId;
  room.status = 'active'; // Start game when opponent joins

  await room.save();
  
  // Return populated room
  const populatedRoom = await Room.findOne({ roomCode })
    .populate('host', 'username _id')
    .populate('opponent', 'username _id');
    
  return populatedRoom;
};

// Leave a room
const leaveRoom = async (roomCode, playerId) => {
  const room = await Room.findOne({ roomCode });

  if (!room) {
    throw new Error('Room not found');
  }

  // If host leaves, delete the room
  if (room.host.toString() === playerId.toString()) {
    await Room.deleteOne({ roomCode });
    return { deleted: true };
  }

  // If opponent leaves, set opponent to null and status to waiting
  if (room.opponent && room.opponent.toString() === playerId.toString()) {
    room.opponent = null;
    room.status = 'waiting';
    await room.save();
  }

  return room;
};

// Get room by code
const getRoomByCode = async (roomCode) => {
  const room = await Room.findOne({ roomCode })
    .populate('host', 'username _id')
    .populate('opponent', 'username _id');

  if (!room) {
    throw new Error('Room not found');
  }

  return room;
};

module.exports = {
  generateRoomCode,
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomByCode,
};
