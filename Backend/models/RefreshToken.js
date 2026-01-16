const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  device: String,
  ipAddress: String,
  expiresAt: Date,
  isRevoked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Auto-delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster lookups
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ user: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
