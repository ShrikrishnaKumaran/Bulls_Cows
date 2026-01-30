/**
 * ============================================================
 * Game Handler - Online 1v1 Real-time Game Logic
 * ============================================================
 * 
 * Manages the actual gameplay via Socket.io events:
 * - Secret submission and validation
 * - Turn-based guessing
 * - Score tracking for best-of-N format
 * - Win/round detection
 * - Server-side timer for Hard mode
 * 
 * Game Flow:
 * 1. SETUP: Both players submit their secret numbers
 * 2. PLAYING: Players take turns guessing each other's secrets
 * 3. GAME_OVER: A player reaches the required wins (best-of format)
 * 
 * Socket Events Handled:
 * - game-init: Get current game state (for reconnection)
 * - submit-secret: Submit secret number during SETUP phase
 * - submit-guess: Submit a guess during PLAYING phase
 */

const { calculateBullsAndCows, validateInput } = require('../utils/gameRules');
const gameManager = require('./gameManager');

// Timer constants
const TIMER_DURATION = 30; // seconds

/**
 * Initialize game handler for a socket connection
 * @param {SocketIO.Server} io - Socket.io server instance
 * @param {SocketIO.Socket} socket - Connected client socket
 * @param {Object} activeGames - In-memory game state storage { roomCode: gameState }
 */
const gameHandler = (io, socket, activeGames) => {
  const oderId = socket.user._id.toString();
  
  // Helper to start/restart timer for Hard mode
  const startTurnTimer = (roomCode, game) => {
    if (game.difficulty !== 'hard') return;
    
    gameManager.startTimer(
      roomCode,
      // onTick - broadcast timer updates
      (timeLeft) => {
        io.to(roomCode).emit('timer-tick', { timeLeft });
      },
      // onTimeout - skip turn
      () => {
        // Pass the game object to skipTurn (it's stored in activeGames, not gameManager)
        const skipResult = gameManager.skipTurn(roomCode, activeGames[roomCode]);
        if (skipResult) {
          io.to(roomCode).emit('turn-skipped', {
            skippedPlayer: skipResult.skippedPlayer,
            nextTurn: skipResult.nextTurn,
            message: 'Turn skipped due to timeout',
          });
          
          // Reset timer for next player using the game from activeGames
          startTurnTimer(roomCode, activeGames[roomCode]);
        }
      },
      // Pass the game object for external storage
      game
    );
  };

  // ─────────────────────────────────────────────────────────────
  // EVENT: game-init
  // Purpose: Get current game state (useful for page refresh/reconnection)
  // ─────────────────────────────────────────────────────────────
  socket.on('game-init', ({ roomCode }, callback) => {
    try {
      const game = activeGames[roomCode];
      
      if (!game) {
        return callback({ success: false, message: 'Game not found' });
      }

      // Verify player is part of this game
      const isHost = game.host.oderId === oderId;
      const isOpponent = game.opponent.oderId === oderId;
      
      if (!isHost && !isOpponent) {
        return callback({ success: false, message: 'You are not part of this game' });
      }

      // Return game state WITHOUT exposing secrets
      callback({
        success: true,
        gameState: {
          status: game.status,
          currentTurn: game.currentTurn,
          logs: game.logs,
          format: game.format,
          digits: game.digits,
          hostReady: !!game.secrets[game.host.oderId],
          opponentReady: !!game.secrets[game.opponent.oderId],
          roundNumber: game.roundNumber,
          scores: game.scores
        }
      });
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT: submit-secret
  // Purpose: Player submits their secret number during SETUP phase
  // ─────────────────────────────────────────────────────────────
  socket.on('submit-secret', ({ roomCode, secret }, callback) => {
    try {
      const game = activeGames[roomCode];
      
      if (!game) {
        return callback({ success: false, message: 'Game not found' });
      }

      // Verify player is part of this game
      if (game.host.oderId !== oderId && game.opponent.oderId !== oderId) {
        return callback({ success: false, message: 'You are not part of this game' });
      }

      // Validate secret format (unique digits, correct length)
      const validation = validateInput(secret, game.digits);
      if (!validation.isValid) {
        return callback({ success: false, message: validation.error });
      }

      // Prevent resubmission
      if (game.secrets[oderId]) {
        return callback({ success: false, message: 'You have already submitted your secret' });
      }

      // Store secret (NEVER send to opponent!)
      game.secrets[oderId] = secret;

      // Notify opponent that this player is ready
      const opponentId = game.host.oderId === oderId ? game.opponent.oderId : game.host.oderId;
      const opponentSocketId = game.playerSockets[opponentId];
      
      if (opponentSocketId) {
        io.to(opponentSocketId).emit('opponent-ready', { oderId: oderId });
      }

      callback({ success: true, message: 'Secret submitted successfully' });

      // Check if both players have submitted - start the match!
      const hostId = game.host.oderId;
      const oppId = game.opponent.oderId;
      
      if (game.secrets[hostId] && game.secrets[oppId]) {
        game.status = 'PLAYING';
        
        // Determine who goes first:
        // - Round 1: Random 50/50 chance
        // - Subsequent rounds: Previous round's loser starts
        if (game.roundLoser) {
          // Loser of previous round starts
          game.currentTurn = game.roundLoser;
          delete game.roundLoser; // Clear after using
        } else {
          // First round: Random selection
          const players = [hostId, oppId];
          game.currentTurn = players[Math.floor(Math.random() * 2)];
        }
        
        // Notify both players
        io.to(roomCode).emit('match-start', {
          currentTurn: game.currentTurn,
          roundNumber: game.roundNumber,
          timerDuration: game.difficulty === 'hard' ? TIMER_DURATION : null,
        });
        
        // Start timer for Hard mode
        startTurnTimer(roomCode, game);
      }
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT: submit-guess
  // Purpose: Player submits a guess during PLAYING phase
  // ─────────────────────────────────────────────────────────────
  socket.on('submit-guess', ({ roomCode, guess }, callback) => {
    try {
      const game = activeGames[roomCode];
      
      if (!game) {
        return callback({ success: false, message: 'Game not found' });
      }

      // Validate game state
      if (game.status !== 'PLAYING') {
        return callback({ success: false, message: 'Game is not in playing state' });
      }

      // Validate turn
      if (game.currentTurn !== oderId) {
        return callback({ success: false, message: 'It is not your turn' });
      }

      // Validate guess format
      const validation = validateInput(guess, game.digits);
      if (!validation.isValid) {
        return callback({ success: false, message: validation.error });
      }

      // Get opponent's secret and calculate result
      const opponentId = game.host.oderId === oderId ? game.opponent.oderId : game.host.oderId;
      const opponentSecret = game.secrets[opponentId];
      const result = calculateBullsAndCows(opponentSecret, guess, game.digits);

      if (result.error) {
        return callback({ success: false, message: result.error });
      }

      // Create log entry
      const logEntry = {
        player: oderId,
        playerName: socket.user.username,
        guess,
        bulls: result.bulls,
        cows: result.cows,
        shit: result.shit,
        timestamp: new Date()
      };

      game.logs.push(logEntry);
      game.currentTurn = opponentId; // Switch turn

      callback({ success: true, result: logEntry });

      // Broadcast turn result to all players in room
      io.to(roomCode).emit('turn-result', {
        ...logEntry,
        nextTurn: game.currentTurn
      });
      
      // Reset timer for next player's turn (Hard mode)
      if (game.difficulty === 'hard') {
        gameManager.stopTimer(roomCode);
        startTurnTimer(roomCode, game);
      }

      // ─── WIN CONDITION CHECK ───
      if (result.isWin) {
        game.scores[oderId] = (game.scores[oderId] || 0) + 1;
        
        const hostScore = game.scores[game.host.oderId] || 0;
        const opponentScore = game.scores[game.opponent.oderId] || 0;
        const winsNeeded = Math.ceil(game.format / 2); // Best of 3 = 2 wins, Best of 5 = 3 wins

        if (game.scores[oderId] >= winsNeeded) {
          // ─── MATCH WON ───
          game.status = 'GAME_OVER';
          
          // Stop timer on game over
          gameManager.stopTimer(roomCode);
          
          io.to(roomCode).emit('game-over', {
            winner: oderId,
            winnerName: socket.user.username,
            finalScores: {
              [game.host.oderId]: hostScore,
              [game.opponent.oderId]: opponentScore
            },
            hostId: game.host.oderId,
            opponentId: game.opponent.oderId
          });

          // Cleanup game from memory after 1 minute
          setTimeout(() => {
            gameManager.deleteGame(roomCode);
            delete activeGames[roomCode];
          }, 60000);
          
        } else {
          // ─── ROUND WON - Continue to next round ───
          // Stop timer for setup phase
          gameManager.stopTimer(roomCode);
          
          game.roundNumber += 1;
          game.status = 'SETUP';
          game.secrets = {};
          game.logs = [];
          
          // Store the round loser - they will start next round
          game.roundLoser = opponentId;
          game.currentTurn = null;

          io.to(roomCode).emit('round-over', {
            roundWinner: oderId,
            roundWinnerName: socket.user.username,
            roundLoser: opponentId,
            scores: {
              [game.host.oderId]: game.scores[game.host.oderId] || 0,
              [game.opponent.oderId]: game.scores[game.opponent.oderId] || 0
            },
            nextRound: game.roundNumber
          });
        }
      }
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });
};

module.exports = gameHandler;
