const authService = require('../services/authService');
const UAParser = require('ua-parser-js');

// Helper to extract device info from user-agent
const getDeviceInfo = (userAgent) => {
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();

  return device.type || 'Desktop';
};

// Helper to extract IP address
const getIpAddress = (req) => {
  return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

// Cookie options
const getCookieOptions = () => ({
  httpOnly: true, // Prevents XSS attacks by restricting access to the cookie from JavaScript and only allowing server-side access
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production 
  sameSite: 'strict', // CSRF protection no extrnal requests are allowed to get the cookie only same site requests
  maxAge: 30 * 24 * 60 * 60 * 1000, // after 30 days the cookie will expire and user needs to login again
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const device = getDeviceInfo(req.headers['user-agent']);
    const ipAddress = getIpAddress(req);
    
    const userData = await authService.register(req.body, device, ipAddress);
    
    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', userData.refreshToken, getCookieOptions());//getCookieOptions() funciton are set of rules for the cookie storage
    
    // Send access token in response body
    res.status(201).json({
      _id: userData._id,
      username: userData.username,
      email: userData.email,
      accessToken: userData.accessToken,
    });
  } catch (error) {
    let message = 'Registration failed. Please try again.';
    if (error.message === 'Email already exists') {
      message = 'An account with this email already exists';
    } else if (error.message === 'Username already exists') {
      message = 'This username is already taken';
    }
    res.status(400).json({ message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const device = getDeviceInfo(req.headers['user-agent']);
    const ipAddress = getIpAddress(req);
    
    const userData = await authService.login(req.body, device, ipAddress);
    
    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', userData.refreshToken, getCookieOptions());
    
    // Send access token in response body
    res.status(200).json({
      _id: userData._id,
      username: userData.username,
      email: userData.email,
      accessToken: userData.accessToken,
    });
  } catch (error) {
    const message = error.message === 'Invalid credentials'
      ? 'Invalid email or password'
      : error.message || 'Login failed. Please try again.';
    res.status(401).json({ message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: 'User profile not found' });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (requires refresh token in cookie)
const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }
    
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: 'Session expired. Please login again.' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken', getCookieOptions());
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to logout. Please try again.' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  refresh,
  logout,
};
