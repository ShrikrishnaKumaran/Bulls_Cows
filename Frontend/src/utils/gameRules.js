/**
 * Bulls and Cows Game Rules Utility
 * Shared logic for calculating game results (Frontend version)
 */

/**
 * Validates if a string is valid for Bulls and Cows game
 * @param {string} str - The string to validate
 * @param {number} digits - Number of digits (3 or 4)
 * @returns {object} - {isValid: boolean, error: string}
 */
export const validateInput = (str, digits = 4) => {
  if (!str) {
    return { isValid: false, error: 'Input is required' };
  }

  if (typeof str !== 'string') {
    return { isValid: false, error: 'Input must be a string' };
  }

  if (str.length !== digits) {
    return { isValid: false, error: `Input must be exactly ${digits} digits` };
  }

  if (!/^\d+$/.test(str)) {
    return { isValid: false, error: 'Input must contain only numbers' };
  }

  const uniqueDigits = new Set(str.split(''));
  if (uniqueDigits.size !== digits) {
    return { isValid: false, error: 'All digits must be unique' };
  }

  return { isValid: true };
};

/**
 * Calculate Bulls and Cows for a guess against a secret
 * @param {string} secret - The secret number to guess
 * @param {string} guess - The player's guess
 * @param {number} digits - Number of digits (3 or 4, default 4)
 * @returns {object} - {bulls: number, cows: number, shit: number, isWin: boolean, error: string}
 */
export const calculateBullsAndCows = (secret, guess, digits = 4) => {
  const secretValidation = validateInput(secret, digits);
  if (!secretValidation.isValid) {
    return {
      bulls: 0,
      cows: 0,
      shit: 0,
      isWin: false,
      error: `Invalid secret: ${secretValidation.error}`
    };
  }

  const guessValidation = validateInput(guess, digits);
  if (!guessValidation.isValid) {
    return {
      bulls: 0,
      cows: 0,
      shit: 0,
      isWin: false,
      error: `Invalid guess: ${guessValidation.error}`
    };
  }

  let bulls = 0;
  let cows = 0;
  const secretArray = secret.split('');
  const guessArray = guess.split('');

  for (let i = 0; i < digits; i++) {
    if (secretArray[i] === guessArray[i]) {
      bulls++;
    }
  }

  for (let i = 0; i < digits; i++) {
    if (secretArray[i] !== guessArray[i]) {
      if (secretArray.includes(guessArray[i])) {
        cows++;
      }
    }
  }

  const shit = digits - bulls - cows;
  const isWin = bulls === digits;

  return {
    bulls,
    cows,
    shit,
    isWin,
    error: null
  };
};

/**
 * Generate a random secret number with unique digits
 * @param {number} digits - Number of digits (3 or 4)
 * @returns {string} - Random number with unique digits
 */
export const generateSecret = (digits = 4) => {
  const availableDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const secret = [];

  for (let i = 0; i < digits; i++) {
    const randomIndex = Math.floor(Math.random() * availableDigits.length);
    secret.push(availableDigits[randomIndex]);
    availableDigits.splice(randomIndex, 1);
  }

  return secret.join('');
};
