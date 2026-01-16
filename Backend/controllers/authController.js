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
  httpOnly: true, // Prevents XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict', // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
    res.cookie('refreshToken', userData.refreshToken, getCookieOptions());
    
    // Send access token in response body
    res.status(201).json({
      _id: userData._id,
      username: userData.username,
      email: userData.email,
      accessToken: userData.accessToken,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.status(401).json({ message: error.message });
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
    res.status(404).json({ message: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (requires refresh token in cookie)
const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }
    
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
  }
};

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAll = async (req, res) => {
  try {
    await authService.logoutAll(req.user._id);
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken', getCookieOptions());
    res.status(200).json({ message: 'Logged out from all devices' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  refresh,
  logout,
  logoutAll,
};
