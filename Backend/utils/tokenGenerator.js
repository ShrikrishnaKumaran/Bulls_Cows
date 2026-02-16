const jwt = require('jsonwebtoken');

// Generate access token (medium-lived for better UX)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' ,
  });
};

// Generate refresh token (long-lived - 30 days)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
