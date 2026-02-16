const mongoose = require('mongoose');

// Generate a short, readable UID (e.g., #9921)
const generateUID = () => {
  const num = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `#${num}`;
};

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    required: true,
    default: generateUID
  },

  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: [true, 'Username already taken'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, "Username can contain only letters, numbers, and underscores"]
  },

  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default include it only when explicitly asked via select('+password')
  },

  stats: {
    totalGames: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    }
  },

  // Friend System
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  friendRequests: {
    incoming: [{
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending'],
        default: 'pending'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    outgoing: [{
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending'],
        default: 'pending'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Match History for profile display
  matchHistory: [{
    opponent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    opponentName: String,
    result: {
      type: String,
      enum: ['win', 'loss']
    },
    score: String, // e.g., "3-1"
    format: Number // Best of 1, 3, 5
  }],

  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure UID is unique - retry if collision
userSchema.pre('save', async function(next) {
  // Only generate UID for new users OR if UID is missing
  if (this.isNew || !this.uid) {
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isUnique && attempts < maxAttempts) {
      this.uid = generateUID();
      const existingUser = await mongoose.model('User').findOne({ uid: this.uid });
      if (!existingUser) {
        isUnique = true;
      } else {
        attempts++;
      }
    }
    
    if (!isUnique) {
      return next(new Error('Could not generate unique UID'));
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
