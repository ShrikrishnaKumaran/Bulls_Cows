const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 4
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'cancelled'],
    default: 'waiting'
  },
  format: {
    type: Number,
    enum: [1, 3, 5],
    default: 3
  },
  digits: {
    type: Number,
    enum: [3, 4],
    default: 4
  },
  difficulty: {
    type: String,
    enum: ['easy', 'hard'],
    default: 'easy'
  }
}, {
  timestamps: true
});

// Auto-delete room after 1 hour
roomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('Room', roomSchema);
