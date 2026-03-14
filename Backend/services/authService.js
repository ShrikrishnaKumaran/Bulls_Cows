const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenGenerator');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//Authentication Service part 
// Create and store refresh token
const createRefreshToken = async (userId) => {
  const token = generateRefreshToken(userId);
  
  // Calculate expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  // Store refresh token in database
  await RefreshToken.create({
    user: userId,
    token,
    expiresAt,
    isRevoked: false
  });
  
  return token;
};

//actual service functions
// Register user
const register = async (userData) => {
  const { username, email, password } = userData;

  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new Error('Email already exists');
  }

  // Check if username already exists
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    throw new Error('Username already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  if (user) {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = await createRefreshToken(user._id);
    
    return {
      _id: user._id,
      uid: user.uid,
      username: user.username,
      email: user.email,
      accessToken,
      refreshToken,
    };
  } else {
    throw new Error('Invalid user data');
  }
};

// Login user
const login = async (credentials) => {
  const { email, password } = credentials;

  // Check for user email (include password since select: false in schema)
  const user = await User.findOne({ email }).select('+password');

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = await createRefreshToken(user._id);
    
    return {
      _id: user._id,
      uid: user.uid,
      username: user.username,
      email: user.email,
      accessToken,
      refreshToken,
    };
  } else {
    throw new Error('Invalid credentials');
  }
};

// Get user profile
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

// Refresh access token using refresh token
const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET
    );
    
    // Check if refresh token exists in database
    const storedToken = await RefreshToken.findOne({ 
      token: refreshToken,
      user: decoded.id 
    });
    
    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }
    
    // Check if token is revoked
    if (storedToken.isRevoked) {
      throw new Error('Refresh token has been revoked');
    }
    
    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      throw new Error('Refresh token expired');
    }
    
    // Generate new access token
    const accessToken = generateAccessToken(decoded.id);
    
    return { accessToken };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Logout user - revoke refresh token
const logout = async (refreshToken) => {
  try {
    await RefreshToken.updateOne(
      { token: refreshToken },
      { isRevoked: true }
    );
    return { message: 'Logged out successfully' };
  } catch (error) {
    throw new Error('Logout failed');
  }
};

// Google login - verify Google ID token, find or create user, issue JWT tokens
const googleLogin = async (idToken) => {
  // Verify the Google ID token
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name } = payload;

  if (!email) {
    throw new Error('Google account has no email');
  }

  // Check if user already exists with this googleId
  let user = await User.findOne({ googleId });

  if (!user) {
    // Check if a local user exists with the same email — link accounts
    user = await User.findOne({ email });

    if (user) {
      // Link Google to existing local account
      user.googleId = googleId;
      if (user.provider === 'local') {
        user.provider = 'local'; // keep as local since they also have a password
      }
      await user.save();
    } else {
      // Create a new Google user
      // Generate a username from the Google name or email prefix
      let baseUsername = (name || email.split('@')[0])
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .substring(0, 20);

      // Ensure username is unique
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername.substring(0, 16)}_${counter}`;
        counter++;
      }

      user = await User.create({
        username,
        email,
        provider: 'google',
        googleId,
      });
    }
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);

  return {
    _id: user._id,
    uid: user.uid,
    username: user.username,
    email: user.email,
    accessToken,
    refreshToken,
  };
};

module.exports = {
  register,
  login,
  googleLogin,
  getUserProfile,
  refreshAccessToken,
  logout,
};
