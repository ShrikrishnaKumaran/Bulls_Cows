const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  roomId: {
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
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  mode: {
    type: String,
    enum: ['online', 'tournament'],
    required: true
  },
  format: {
    type: Number,
    enum: [1, 3, 5],
    default: 3
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'cancelled'],
    default: 'waiting'
  },
  difficulty: {
    type: String,
    default: 'easy'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-delete matches after 1 hour
matchSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('Match', matchSchema);
