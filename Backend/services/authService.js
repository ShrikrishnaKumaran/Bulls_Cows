const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenGenerator');

//Authentication Service part 
// Create and store refresh token
const createRefreshToken = async (userId, device = null, ipAddress = null) => {
  const token = generateRefreshToken(userId);
  
  // Calculate expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  // Store refresh token in database
  await RefreshToken.create({
    user: userId,
    token,
    device,
    ipAddress,
    expiresAt,
    isRevoked: false
  });
  
  return token;
};

//actual service functions
// Register user
const register = async (userData, device = null, ipAddress = null) => {
  const { username, email, password } = userData;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
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
    const refreshToken = await createRefreshToken(user._id, device, ipAddress);
    
    return {
      _id: user._id,
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
const login = async (credentials, device = null, ipAddress = null) => {
  const { email, password } = credentials;

  // Check for user email (include password since select: false in schema)
  const user = await User.findOne({ email }).select('+password');

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = await createRefreshToken(user._id, device, ipAddress);
    
    return {
      _id: user._id,
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
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
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

// Logout from all devices - revoke all user's refresh tokens
const logoutAll = async (userId) => {
  try {
    await RefreshToken.updateMany(
      { user: userId },
      { isRevoked: true }
    );
    return { message: 'Logged out from all devices' };
  } catch (error) {
    throw new Error('Logout failed');
  }
};

module.exports = {
  register,
  login,
  getUserProfile,
  refreshAccessToken,
  logout,
  logoutAll,
};
