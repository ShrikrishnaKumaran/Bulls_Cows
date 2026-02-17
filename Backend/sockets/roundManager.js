/**
 * Update player score after winning a round
 * @param {Object} game - Game object
 * @param {string} oderId - Winning player's ID
 * @returns {number} Updated score for the player
 */
const updateScore = (game, oderId) => {
  game.scores[oderId] = (game.scores[oderId] || 0) + 1;
  return game.scores[oderId];
};

/**
 * Calculate wins needed for match victory (best-of format)
 * @param {number} format - Best of N (1, 3, or 5)
 * @returns {number} Wins needed (1, 2, or 3)
 */
const getWinsNeeded = (format) => {
  return Math.ceil(format / 2);
};

/**
 * Check if player has won the match
 * @param {Object} game - Game object
 * @param {string} oderId - Player's ID
 * @returns {boolean} True if player won the match
 */
const hasWonMatch = (game, oderId) => {
  const playerScore = game.scores[oderId] || 0;
  const winsNeeded = getWinsNeeded(game.format);
  return playerScore >= winsNeeded;
};

// ═══════════════════════════════════════════════════════════
// ROUND FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Reset game state for next round
 * @param {Object} game - Game object
 * @param {string} roundLoserId - ID of player who lost the round (starts next)
 */
const resetForNextRound = (game, roundLoserId) => {
  game.roundNumber += 1;
  game.status = 'SETUP';
  game.secrets = {};
  game.logs = [];
  game.guessCounter = 0; // Reset guess counter for new round
  game.roundLoser = roundLoserId; // Loser starts next round
  game.currentTurn = null;
};

/**
 * Mark game as complete
 * @param {Object} game - Game object
 */
const setGameOver = (game) => {
  game.status = 'GAME_OVER';
};

/**
 * Get current scores for both players
 * @param {Object} game - Game object
 * @returns {Object} { hostScore, opponentScore }
 */
const getScores = (game) => {
  return {
    hostScore: game.scores[game.host.oderId] || 0,
    opponentScore: game.scores[game.opponent.oderId] || 0,
  };
};

/**
 * Build final scores object for game-over event
 * @param {Object} game - Game object
 * @returns {Object} Scores keyed by player ID
 */
const buildFinalScores = (game) => {
  const { hostScore, opponentScore } = getScores(game);
  return {
    [game.host.oderId]: hostScore,
    [game.opponent.oderId]: opponentScore,
  };
};

/**
 * Determine first player for a round
 * @param {Object} game - Game object
 * @returns {string} Player ID who goes first
 */
const determineFirstPlayer = (game) => {
  const hostId = game.host.oderId;
  const oppId = game.opponent.oderId;
  
  // Subsequent rounds: Previous round's loser starts
  if (game.roundLoser) {
    const firstPlayer = game.roundLoser;
    delete game.roundLoser; // Clear after using
    return firstPlayer;
  }
  
  // First round: Random selection
  const players = [hostId, oppId];
  return players[Math.floor(Math.random() * 2)];
};

module.exports = {
  updateScore,
  getWinsNeeded,
  hasWonMatch,
  resetForNextRound,
  setGameOver,
  getScores,
  buildFinalScores,
  determineFirstPlayer,
};
