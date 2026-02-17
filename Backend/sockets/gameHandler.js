const { calculateBullsAndCows, validateInput } = require('../utils/gameRules');
const timerManager = require('./timerManager');
const roundManager = require('./roundManager');

// ═══════════════════════════════════════════════════════════
// SOCKET EVENT HANDLER
// ═══════════════════════════════════════════════════════════

/**
 * Initialize game handler for a socket connection
 * @param {SocketIO.Server} io - Socket.io server instance
 * @param {SocketIO.Socket} socket - Connected client socket
 * @param {Object} activeGames - In-memory game state storage { roomCode: gameState }
 */
const gameHandler = (io, socket, activeGames) => {
  const oderId = socket.user._id.toString();
  
  /**
   * Helper: Start/restart timer for Hard mode
   */
  const startTurnTimer = (roomCode, game) => {
    if (game.difficulty !== 'hard') return;
    
    timerManager.startTimer(
      roomCode,
      (timeLeft) => io.to(roomCode).emit('timer-tick', { timeLeft }),
      () => {
        const skipResult = timerManager.skipTurn(activeGames[roomCode]);
        if (skipResult) {
          io.to(roomCode).emit('turn-skipped', {
            skippedPlayer: skipResult.skippedPlayer,
            nextTurn: skipResult.nextTurn,
            message: 'Turn skipped due to timeout',
          });
          startTurnTimer(roomCode, activeGames[roomCode]);
        }
      },
      game
    );
  };

  // ─────────────────────────────────────────────────────────────
  // EVENT: game-init
  // ─────────────────────────────────────────────────────────────
  socket.on('game-init', ({ roomCode }, callback) => {
    try {
      const game = activeGames[roomCode];
      
      if (!game) {
        return callback({ success: false, message: 'Game not found' });
      }

      const isHost = game.host.oderId === oderId;
      const isOpponent = game.opponent.oderId === oderId;
      
      if (!isHost && !isOpponent) {
        return callback({ success: false, message: 'You are not part of this game' });
      }

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
  // ─────────────────────────────────────────────────────────────
  socket.on('submit-secret', ({ roomCode, secret }, callback) => {
    try {
      const game = activeGames[roomCode];
      
      if (!game) {
        return callback({ success: false, message: 'Game not found' });
      }

      if (game.host.oderId !== oderId && game.opponent.oderId !== oderId) {
        return callback({ success: false, message: 'You are not part of this game' });
      }

      const validation = validateInput(secret, game.digits);
      if (!validation.isValid) {
        return callback({ success: false, message: validation.error });
      }

      if (game.secrets[oderId]) {
        return callback({ success: false, message: 'You have already submitted your secret' });
      }

      // Store secret
      game.secrets[oderId] = secret;

      // Notify opponent
      const opponentId = game.host.oderId === oderId ? game.opponent.oderId : game.host.oderId;
      const opponentSocketId = game.playerSockets[opponentId];
      if (opponentSocketId) {
        io.to(opponentSocketId).emit('opponent-ready', { oderId });
      }

      callback({ success: true, message: 'Secret submitted successfully' });

      // Check if both ready - start match
      const hostId = game.host.oderId;
      const oppId = game.opponent.oderId;
      
      if (game.secrets[hostId] && game.secrets[oppId]) {
        game.status = 'PLAYING';
        game.currentTurn = roundManager.determineFirstPlayer(game);
        
        io.to(roomCode).emit('match-start', {
          currentTurn: game.currentTurn,
          roundNumber: game.roundNumber,
          timerDuration: game.difficulty === 'hard' ? timerManager.TIMER_DURATION : null,
        });
        
        startTurnTimer(roomCode, game);
      }
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // EVENT: submit-guess
  // ─────────────────────────────────────────────────────────────
  socket.on('submit-guess', ({ roomCode, guess }, callback) => {
    try {
      const game = activeGames[roomCode];
      
      if (!game) {
        return callback({ success: false, message: 'Game not found' });
      }

      if (game.status !== 'PLAYING') {
        return callback({ success: false, message: 'Game is not in playing state' });
      }

      if (game.currentTurn !== oderId) {
        return callback({ success: false, message: 'It is not your turn' });
      }

      const validation = validateInput(guess, game.digits);
      if (!validation.isValid) {
        return callback({ success: false, message: validation.error });
      }

      // Calculate result
      const opponentId = game.host.oderId === oderId ? game.opponent.oderId : game.host.oderId;
      const result = calculateBullsAndCows(game.secrets[opponentId], guess, game.digits);

      if (result.error) {
        return callback({ success: false, message: result.error });
      }

      // Log entry
      game.guessCounter = (game.guessCounter || 0) + 1;
      const logEntry = {
        player: oderId,
        playerName: socket.user.username,
        guess,
        bulls: result.bulls,
        cows: result.cows,
        shit: result.shit,
        guessNumber: game.guessCounter,
        timestamp: new Date()
      };

      game.logs.push(logEntry);
      game.currentTurn = opponentId;

      callback({ success: true, result: logEntry });

      io.to(roomCode).emit('turn-result', { ...logEntry, nextTurn: game.currentTurn });
      
      // Reset timer for next turn
      if (game.difficulty === 'hard') {
        timerManager.stopTimer(roomCode);
        startTurnTimer(roomCode, game);
      }

      // ─── WIN CHECK ───
      if (result.isWin) {
        roundManager.updateScore(game, oderId);
        const finalScores = roundManager.buildFinalScores(game);

        if (roundManager.hasWonMatch(game, oderId)) {
          // ─── MATCH WON ───
          roundManager.setGameOver(game);
          timerManager.stopTimer(roomCode);
          
          io.to(roomCode).emit('game-over', {
            winner: oderId,
            winnerName: socket.user.username,
            finalScores,
            hostId: game.host.oderId,
            opponentId: game.opponent.oderId
          });

          setTimeout(() => {
            timerManager.stopTimer(roomCode);
            delete activeGames[roomCode];
          }, 60000);
          
        } else {
          // ─── ROUND WON ───
          timerManager.stopTimer(roomCode);
          roundManager.resetForNextRound(game, opponentId);

          io.to(roomCode).emit('round-over', {
            roundWinner: oderId,
            roundWinnerName: socket.user.username,
            roundLoser: opponentId,
            scores: finalScores,
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

