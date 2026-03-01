const { calculateBullsAndCows, validateInput } = require('../utils/gameRules');
const timerManager = require('./timerManager');
const roundManager = require('./roundManager');
const User = require('../models/User');

/**
 * Record match result for both players in MongoDB
 * Uses game object to determine correct winner/loser from scores
 * @param {string} winnerId - Winner's user ID (the player who won)
 * @param {string} loserId - Loser's user ID
 * @param {Object} scores - { [playerId]: score } object  
 * @param {number} format - Match format (1, 3, or 5)
 * @param {number} digits - Number of digits (3 or 4)
 * @param {string} difficulty - 'easy' or 'hard'
 * @param {Object} game - Game object (for matchRecorded flag)
 * @param {string} callerTag - Tag identifying which code path called this
 */
const recordMatchResult = async (winnerId, loserId, scores, format, digits, difficulty, game = null, callerTag = 'unknown') => {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[RECORD] Called by: ${callerTag}`);
    console.log(`[RECORD] Raw args: winnerId=${winnerId}, loserId=${loserId}`);
    console.log(`[RECORD] Scores object:`, JSON.stringify(scores));
    console.log(`${'='.repeat(60)}`);

    // Prevent duplicate recording
    if (game && game.matchRecorded) {
      console.warn('[RECORD] SKIPPED - Match already recorded for this game');
      return;
    }
    if (game) game.matchRecorded = true;

    // Verify winner and loser are different
    if (winnerId === loserId) {
      console.error('[RECORD] BUG: winnerId === loserId!', winnerId);
      return;
    }

    // Verify IDs against DB before recording
    const [winnerUser, loserUser] = await Promise.all([
      User.findById(winnerId).select('username stats'),
      User.findById(loserId).select('username stats')
    ]);

    if (!winnerUser || !loserUser) {
      console.error('[RECORD] Could not find users:', { winnerId, loserId, winnerFound: !!winnerUser, loserFound: !!loserUser });
      return;
    }

    const verifiedWinnerName = winnerUser.username;
    const verifiedLoserName = loserUser.username;

    const winnerScore = scores[winnerId] || 0;
    const loserScore = scores[loserId] || 0;
    const scoreStr = `${winnerScore}-${loserScore}`;
    const reverseScoreStr = `${loserScore}-${winnerScore}`;

    console.log(`[RECORD] >>> WINNER: ${verifiedWinnerName} (${winnerId}) score=${winnerScore} | stats before: W${winnerUser.stats?.wins || 0} L${winnerUser.stats?.losses || 0}`);
    console.log(`[RECORD] >>> LOSER:  ${verifiedLoserName} (${loserId}) score=${loserScore} | stats before: W${loserUser.stats?.wins || 0} L${loserUser.stats?.losses || 0}`);

    // Update winner
    await User.findByIdAndUpdate(winnerId, {
      $inc: { 'stats.totalGames': 1, 'stats.wins': 1 },
      $push: {
        matchHistory: {
          $each: [{
            opponent: loserId,
            opponentName: verifiedLoserName,
            result: 'win',
            score: scoreStr,
            format,
            digits,
            difficulty,
            playedAt: new Date()
          }],
          $position: 0,
          $slice: 50
        }
      }
    });

    // Update loser
    await User.findByIdAndUpdate(loserId, {
      $inc: { 'stats.totalGames': 1, 'stats.losses': 1 },
      $push: {
        matchHistory: {
          $each: [{
            opponent: winnerId,
            opponentName: verifiedWinnerName,
            result: 'loss',
            score: reverseScoreStr,
            format,
            digits,
            difficulty,
            playedAt: new Date()
          }],
          $position: 0,
          $slice: 50
        }
      }
    });

    // VERIFICATION: Read back from DB to confirm data was written correctly
    const [verifyWinner, verifyLoser] = await Promise.all([
      User.findById(winnerId).select('username stats matchHistory').lean(),
      User.findById(loserId).select('username stats matchHistory').lean()
    ]);

    const wLatest = verifyWinner?.matchHistory?.[0];
    const lLatest = verifyLoser?.matchHistory?.[0];

    console.log(`[RECORD] DB VERIFY - ${verifiedWinnerName}: stats W${verifyWinner?.stats?.wins} L${verifyWinner?.stats?.losses}, latest match result=${wLatest?.result}, opponent=${wLatest?.opponentName}`);
    console.log(`[RECORD] DB VERIFY - ${verifiedLoserName}: stats W${verifyLoser?.stats?.wins} L${verifyLoser?.stats?.losses}, latest match result=${lLatest?.result}, opponent=${lLatest?.opponentName}`);
    console.log(`[RECORD] Match recorded: ${verifiedWinnerName} beat ${verifiedLoserName} ${scoreStr} Bo${format}`);
    console.log(`${'='.repeat(60)}\n`);
  } catch (err) {
    console.error('[RECORD] FAILED:', err.message, err.stack);
  }
};

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
  socket.on('submit-guess', async ({ roomCode, guess }, callback) => {
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

      console.log(`[GUESS] ${socket.user.username}(${oderId}) guessed "${guess}" => ${result.bulls}B ${result.cows}C ${result.isWin ? '*** WIN! ***' : ''}`);

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

          // The GUESSER (oderId / socket.user) WON by cracking the opponent's secret
          const guesserId = oderId;
          const guesserName = socket.user.username;
          const loserId = game.host.oderId === guesserId ? game.opponent.oderId : game.host.oderId;

          console.log(`\n${'*'.repeat(60)}`);
          console.log(`[WIN] MATCH WON in room ${roomCode}`);
          console.log(`[WIN] Socket user: ${socket.user.username} (${socket.user._id})`);
          console.log(`[WIN] oderId (closure): ${oderId}`);
          console.log(`[WIN] game.host.oderId: ${game.host.oderId}`);
          console.log(`[WIN] game.opponent.oderId: ${game.opponent.oderId}`);
          console.log(`[WIN] Guesser (WINNER): ${guesserName} = ${guesserId}`);
          console.log(`[WIN] Loser: ${loserId}`);
          console.log(`[WIN] Is guesser the host? ${game.host.oderId === guesserId}`);
          console.log(`[WIN] finalScores:`, JSON.stringify(finalScores));
          console.log(`${'*'.repeat(60)}\n`);

          io.to(roomCode).emit('game-over', {
            winner: guesserId,
            winnerName: guesserName,
            finalScores,
            hostId: game.host.oderId,
            opponentId: game.opponent.oderId
          });

          // Record: guesser = winner, other player = loser
          await recordMatchResult(
            guesserId, loserId,
            finalScores, game.format, game.digits, game.difficulty,
            game, 'submit-guess-win'
          );

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

module.exports = { gameHandler, recordMatchResult };

