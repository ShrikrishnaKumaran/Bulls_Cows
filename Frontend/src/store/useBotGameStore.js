/**
 * useBotGameStore - Zustand store for VS Bot game mode
 * 
 * Similar to useOfflineGameStore but tailored for human vs bot:
 * - Player = human, Opponent = bot  
 * - Bot's secret is auto-generated
 * - Turn-based with bot thinking simulation
 */
import { create } from 'zustand';
import { calculateBullsAndCows, generateSecret } from '../utils/gameRules';

const useBotGameStore = create((set, get) => ({
  // ═══════════════════════════════════════════════════════════
  // SETUP STATE
  // ═══════════════════════════════════════════════════════════

  setupStep: 1, // 1 = Config, 2 = Player enters secret
  config: {
    digits: 4,
    difficulty: 'Easy',
    format: 1,         // 1 = Single, 3 = Best of 3, 5 = Best of 5
    botDifficulty: 'Easy', // 'Easy' (SURVIVOR) or 'Hard' (DOMINATOR)
  },

  // ═══════════════════════════════════════════════════════════
  // GAME STATE
  // ═══════════════════════════════════════════════════════════

  gamePhase: 'SETUP', // 'SETUP' | 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER'
  turn: 'PLAYER', // 'PLAYER' | 'BOT'

  // Secrets
  playerSecret: '',   // Human's secret (bot guesses this)
  botSecret: '',       // Bot's secret (human guesses this)

  // Guess History
  playerGuesses: [],   // Human's guesses against bot's secret
  botGuesses: [],      // Bot's guesses against human's secret

  // Results
  winner: null,        // 'PLAYER' | 'BOT' | null
  roundWinner: null,

  // Score Tracking
  score: {
    player: 0,
    bot: 0,
  },
  currentRound: 1,

  // Bot state
  botThinking: false,
  lastBotTaunt: '',

  // ═══════════════════════════════════════════════════════════
  // SETUP ACTIONS
  // ═══════════════════════════════════════════════════════════

  setStep: (step) => set({ setupStep: step }),

  setConfig: (key, value) => {
    // If changing botDifficulty, also sync difficulty for timer rules
    if (key === 'botDifficulty') {
      set((state) => ({
        config: { ...state.config, botDifficulty: value, difficulty: value }
      }));
    } else {
      set((state) => ({
        config: { ...state.config, [key]: value }
      }));
    }
  },

  setPlayerSecret: (code) => set({ playerSecret: code }),

  resetSetup: () => set({
    setupStep: 1,
    gamePhase: 'SETUP',
    config: { digits: 4, difficulty: 'Easy', format: 1, botDifficulty: 'Easy' },
    playerSecret: '',
    botSecret: '',
    playerGuesses: [],
    botGuesses: [],
    winner: null,
    roundWinner: null,
    score: { player: 0, bot: 0 },
    currentRound: 1,
    turn: 'PLAYER',
    botThinking: false,
    lastBotTaunt: '',
  }),

  // ═══════════════════════════════════════════════════════════
  // GAME ACTIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Start the game: generate bot's secret, validate player secret.
   */
  startGame: () => {
    const { playerSecret, config, turn } = get();
    const { digits } = config;

    if (!playerSecret || playerSecret.length !== digits) {
      return { success: false, error: 'Your secret code is invalid' };
    }

    // Check uniqueness
    if (new Set(playerSecret.split('')).size !== digits) {
      return { success: false, error: 'All digits must be unique' };
    }

    // Generate bot's secret
    const botSecret = generateSecret(digits);

    set({
      botSecret,
      gamePhase: 'PLAYING',
      turn: turn || 'PLAYER',
      playerGuesses: [],
      botGuesses: [],
      winner: null,
    });

    return { success: true };
  },

  /**
   * Human submits a guess against the bot's secret.
   */
  submitPlayerGuess: (guess) => {
    const { botSecret, playerGuesses, config, score } = get();
    const { digits } = config;

    const result = calculateBullsAndCows(botSecret, guess, digits);
    if (result.error) {
      return { success: false, error: result.error };
    }

    const newGuess = {
      guess,
      bulls: result.bulls,
      cows: result.cows,
      shit: result.shit,
      attempt: playerGuesses.length + 1,
    };

    const updatedGuesses = [...playerGuesses, newGuess];

    // Check win
    if (result.isWin) {
      const newScore = { ...score, player: score.player + 1 };
      const requiredWins = Math.ceil(config.format / 2);

      if (newScore.player >= requiredWins) {
        set({
          playerGuesses: updatedGuesses,
          gamePhase: 'GAME_OVER',
          winner: 'PLAYER',
          score: newScore,
        });
      } else {
        set({
          playerGuesses: updatedGuesses,
          gamePhase: 'ROUND_OVER',
          roundWinner: 'PLAYER',
          score: newScore,
        });
      }
      return { success: true, result, isWin: true };
    }

    // Switch turn to bot
    set({
      playerGuesses: updatedGuesses,
      turn: 'BOT',
    });

    return { success: true, result, isWin: false };
  },

  /**
   * Record the bot's guess against the player's secret.
   * Called by the game page after useBot.makeMove() resolves.
   */
  recordBotGuess: (guess) => {
    const { playerSecret, botGuesses, config, score } = get();
    const { digits } = config;

    const result = calculateBullsAndCows(playerSecret, guess, digits);

    const newGuess = {
      guess,
      bulls: result.bulls,
      cows: result.cows,
      shit: result.shit,
      attempt: botGuesses.length + 1,
    };

    const updatedGuesses = [...botGuesses, newGuess];

    // Check if bot wins
    if (result.isWin) {
      const newScore = { ...score, bot: score.bot + 1 };
      const requiredWins = Math.ceil(config.format / 2);

      if (newScore.bot >= requiredWins) {
        set({
          botGuesses: updatedGuesses,
          gamePhase: 'GAME_OVER',
          winner: 'BOT',
          score: newScore,
        });
      } else {
        set({
          botGuesses: updatedGuesses,
          gamePhase: 'ROUND_OVER',
          roundWinner: 'BOT',
          score: newScore,
        });
      }
      return { result, isWin: true };
    }

    // Switch turn back to player
    set({
      botGuesses: updatedGuesses,
      turn: 'PLAYER',
    });

    return { result, isWin: false };
  },

  setBotThinking: (thinking) => set({ botThinking: thinking }),
  setLastBotTaunt: (taunt) => set({ lastBotTaunt: taunt }),

  /**
   * Continue to next round (Best of 3/5).
   * Loser of previous round goes first.
   */
  continueToNextRound: () => {
    const { roundWinner, currentRound } = get();
    const loser = roundWinner === 'PLAYER' ? 'BOT' : 'PLAYER';

    set({
      playerGuesses: [],
      botGuesses: [],
      playerSecret: '',
      botSecret: '',
      gamePhase: 'SETUP',
      setupStep: 2, // Skip config, go to secret entry
      turn: loser,
      currentRound: currentRound + 1,
      roundWinner: null,
      botThinking: false,
      lastBotTaunt: '',
    });
  },

  /**
   * Skip turn (timer expiry in Hard mode).
   */
  skipTurn: () => {
    const { turn, gamePhase } = get();
    if (gamePhase !== 'PLAYING') return;
    set({ turn: turn === 'PLAYER' ? 'BOT' : 'PLAYER' });
  },

  /**
   * Full reset.
   */
  resetGame: () => set({
    gamePhase: 'SETUP',
    setupStep: 1,
    turn: 'PLAYER',
    playerSecret: '',
    botSecret: '',
    playerGuesses: [],
    botGuesses: [],
    winner: null,
    roundWinner: null,
    score: { player: 0, bot: 0 },
    currentRound: 1,
    botThinking: false,
    lastBotTaunt: '',
  }),
}));

export default useBotGameStore;
