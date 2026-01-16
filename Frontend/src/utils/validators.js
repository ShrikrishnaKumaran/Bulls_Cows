// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate username (3-20 characters, alphanumeric and underscore)
export const isValidUsername = (username) => {
  if (!username || username.length < 3 || username.length > 20) {
    return false;
  }
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};

// Validate password (minimum 6 characters)
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Validate room code (6 characters, alphanumeric)
export const isValidRoomCode = (code) => {
  if (!code || code.length !== 6) {
    return false;
  }
  const codeRegex = /^[A-Z0-9]{6}$/;
  return codeRegex.test(code);
};
