// Validate if a guess has 4 unique digits
export const isValidGuess = (guess) => {
  if (!guess || guess.length !== 4) {
    return false;
  }

  // Check if all characters are digits
  if (!/^\d{4}$/.test(guess)) {
    return false;
  }

  // Check for unique digits
  return new Set(guess).size === 4;
};

// Format time in MM:SS format
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Calculate score based on number of guesses
export const calculateScore = (numGuesses) => {
  const baseScore = 1000;
  const penalty = numGuesses * 50;
  return Math.max(baseScore - penalty, 0);
};

// Generate a random 4-digit number with unique digits (for client-side offline games)
export const generateSecretNumber = () => {
  const digits = [];
  while (digits.length < 4) {
    const digit = Math.floor(Math.random() * 10).toString();
    if (!digits.includes(digit)) {
      digits.push(digit);
    }
  }
  return digits.join('');
};

// Calculate bulls and cows for offline games
export const calculateBullsAndCows = (secret, guess) => {
  let bulls = 0;
  let cows = 0;

  for (let i = 0; i < 4; i++) {
    if (secret[i] === guess[i]) {
      bulls++;
    } else if (secret.includes(guess[i])) {
      cows++;
    }
  }

  return { bulls, cows };
};
