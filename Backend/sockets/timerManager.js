const TIMER_DURATION = 30;
const activeTimers = {};
const TIMER_TICK = 1000;
/**
 * Start turn timer (Hard mode only)
 * @param {string} roomCode - Room code
 * @param {Function} onTick - Called each second with remaining time
 * @param {Function} onTimeout - Called when timer expires
 * @param {Object} game - Game object reference from activeGames
 */
const startTimer = (roomCode, onTick, onTimeout, game) => {
  if (!game || game.difficulty !== 'hard') {
    return;
  }
  
  // Clear existing timer
  stopTimer(roomCode);
  
  // Initialize timer value on the game object
  game.timerValue = TIMER_DURATION;
  
  activeTimers[roomCode] = setInterval(() => {
    game.timerValue -= 1;
    
    if (onTick) {
      onTick(game.timerValue);
    }
    
    if (game.timerValue <= 0) {
      stopTimer(roomCode);
      if (onTimeout) {
        onTimeout();
      }
    }
  }, TIMER_TICK);
};

/**
 * Stop turn timer
 * @param {string} roomCode - Room code
 */
const stopTimer = (roomCode) => {
  if (activeTimers[roomCode]) {
    clearInterval(activeTimers[roomCode]);
    delete activeTimers[roomCode];
  }
};

/**
 * Skip current player's turn (called on timeout)
 * @param {Object} game - Game object reference from activeGames
 * @returns {Object|null} { skippedPlayer, nextTurn } or null
 */
const skipTurn = (game) => {
  if (!game || game.status !== 'PLAYING') {
    return null;
  }
  
  const skippedPlayer = game.currentTurn;
  
  // Switch to other player
  game.currentTurn = game.host.oderId === skippedPlayer
    ? game.opponent.oderId
    : game.host.oderId;
  
  return { skippedPlayer, nextTurn: game.currentTurn };
};

module.exports = {
  TIMER_DURATION,
  TIMER_TICK,
  startTimer,
  stopTimer,
  skipTurn,
};
