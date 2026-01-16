// Generate a random number with unique digits
export const generateSecretNumber = (length) => {
  const digits = [];
  while (digits.length < length) {
    const digit = Math.floor(Math.random() * 10);
    if (!digits.includes(digit)) {
      digits.push(digit);
    }
  }
  return digits.join('');
};

// Validate if a guess has unique digits and correct length
export const validateGuess = (guess, requiredLength) => {
  if (!guess || guess.length !== requiredLength) {
    return { valid: false, message: `Must be ${requiredLength} digits` };
  }
  
  if (!/^\d+$/.test(guess)) {
    return { valid: false, message: 'Only numbers allowed' };
  }
  
  const uniqueDigits = new Set(guess.split(''));
  if (uniqueDigits.size !== guess.length) {
    return { valid: false, message: 'Digits must be unique' };
  }
  
  return { valid: true };
};

// Calculate bulls and cows
export const calculateBullsAndCows = (secret, guess) => {
  let bulls = 0;
  let cows = 0;
  
  const secretDigits = secret.split('');
  const guessDigits = guess.split('');
  
  for (let i = 0; i < guessDigits.length; i++) {
    if (guessDigits[i] === secretDigits[i]) {
      bulls++;
    } else if (secretDigits.includes(guessDigits[i])) {
      cows++;
    }
  }
  
  return { bulls, cows };
};

// Check if the game is won
export const isGameWon = (bulls, secretLength) => {
  return bulls === secretLength;
};

// Calculate score based on number of attempts
export const calculateScore = (attempts, secretLength) => {
  const baseScore = 1000;
  const penalty = attempts * 50;
  const difficultyBonus = secretLength * 100;
  return Math.max(0, baseScore - penalty + difficultyBonus);
};
