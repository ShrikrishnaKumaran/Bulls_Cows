const Match = require('../models/Match');

// Bulls and Cows logic - calculate bulls and cows
const calculateBullsAndCows = (secret, guess) => {
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

// Generate random 4-digit secret number with unique digits
const generateSecretNumber = () => {
  const digits = [];
  while (digits.length < 4) {
    const digit = Math.floor(Math.random() * 10).toString();
    if (!digits.includes(digit)) {
      digits.push(digit);
    }
  }
  return digits.join('');
};

// Create a new match
const createMatch = async (matchData) => {
  const { player1, player2, gameMode } = matchData;

  const match = await Match.create({
    player1,
    player2,
    gameMode,
    player1Secret: generateSecretNumber(),
    player2Secret: gameMode === 'online' ? generateSecretNumber() : null,
    status: 'active',
  });

  return match;
};

// Make a guess in a match
const makeGuess = async (matchId, playerId, guess) => {
  const match = await Match.findById(matchId);

  if (!match) {
    throw new Error('Match not found');
  }

  if (match.status !== 'active') {
    throw new Error('Match is not active');
  }

  // Determine which player is guessing
  const isPlayer1 = match.player1.toString() === playerId.toString();
  const secret = isPlayer1 ? match.player2Secret : match.player1Secret;

  // Calculate bulls and cows
  const result = calculateBullsAndCows(secret, guess);

  // Add guess to history
  const guessData = {
    player: playerId,
    guess,
    bulls: result.bulls,
    cows: result.cows,
    timestamp: new Date(),
  };

  match.guessHistory.push(guessData);

  // Check for win (4 bulls)
  if (result.bulls === 4) {
    match.status = 'completed';
    match.winner = playerId;
    match.endedAt = new Date();
  }

  await match.save();

  return {
    match,
    result,
    isWin: result.bulls === 4,
  };
};

// Get match by ID
const getMatchById = async (matchId) => {
  const match = await Match.findById(matchId)
    .populate('player1', 'username')
    .populate('player2', 'username');

  if (!match) {
    throw new Error('Match not found');
  }

  return match;
};

// Get user's match history
const getUserMatches = async (userId) => {
  const matches = await Match.find({
    $or: [{ player1: userId }, { player2: userId }],
  })
    .populate('player1', 'username')
    .populate('player2', 'username')
    .sort({ createdAt: -1 });

  return matches;
};

module.exports = {
  calculateBullsAndCows,
  generateSecretNumber,
  createMatch,
  makeGuess,
  getMatchById,
  getUserMatches,
};
