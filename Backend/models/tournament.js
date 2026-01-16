const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    default: 'My League'
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['lobby', 'active', 'finished'],
    default: 'lobby'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-delete tournament after 1 hour
tournamentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('Tournament', tournamentSchema);
