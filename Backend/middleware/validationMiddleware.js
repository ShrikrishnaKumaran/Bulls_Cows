// Validation middleware for request data

const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email' });
  }

  // Password validation (minimum 6 characters)
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  next();
};

const validateGuess = (req, res, next) => {
  const { guess } = req.body;

  if (!guess) {
    return res.status(400).json({ message: 'Please provide a guess' });
  }

  // Validate guess format (4 unique digits)
  if (!/^\d{4}$/.test(guess)) {
    return res.status(400).json({ message: 'Guess must be 4 digits' });
  }

  // Check for unique digits
  if (new Set(guess).size !== 4) {
    return res.status(400).json({ message: 'Guess must have 4 unique digits' });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateGuess,
};
