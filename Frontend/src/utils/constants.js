/**
 * Application Constants
 * Centralized configuration values and magic strings
 */

// ═══════════════════════════════════════════════════════════
// GAME CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const DIFFICULTY = {
  EASY: 'Easy',
  HARD: 'Hard',
};

export const GAME_FORMAT = {
  SINGLE: 'Single',
  BEST_OF_3: 'Best of 3',
  BEST_OF_5: 'Best of 5',
};

export const GAME_PHASE = {
  SETUP: 'SETUP',
  PLAYER1_SECRET: 'PLAYER1_SECRET',
  HANDOVER: 'HANDOVER',
  PLAYER2_SECRET: 'PLAYER2_SECRET',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
};

export const GAME_STATE = {
  WAITING: 'WAITING',
  SETUP: 'SETUP',
  PLAYING: 'PLAYING',
  FINISHED: 'FINISHED',
};

export const TURN = {
  PLAYER_1: 'PLAYER_1',
  PLAYER_2: 'PLAYER_2',
  ME: 'me',
  OPPONENT: 'opponent',
};

// ═══════════════════════════════════════════════════════════
// GAME RULES
// ═══════════════════════════════════════════════════════════

export const TIMER = {
  MAX_TIME_EASY: 0, // No timer for Easy mode
  MAX_TIME_HARD: 30, // 30 seconds for Hard mode
  TICK_INTERVAL: 1000, // 1 second
};

export const HARD_MODE_HISTORY_LIMIT = 5; // Only show last 5 guesses in Hard mode (FIFO)

export const DIGITS = {
  MIN: 3,
  MAX: 5,
  DEFAULT: 4,
};

// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════

export const VALIDATION = {
  DIGITS_ONLY_REGEX: /^\d+$/,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 6,
  ROOM_CODE_LENGTH: 6,
};

// ═══════════════════════════════════════════════════════════
// UI CONSTANTS
// ═══════════════════════════════════════════════════════════

export const TOAST = {
  DURATION: 3000,
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
  },
};

export const BUTTON_VARIANT = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
  GHOST: 'ghost',
};

export const LOADER_SIZE = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

// ═══════════════════════════════════════════════════════════
// MESSAGES & LABELS
// ═══════════════════════════════════════════════════════════

export const ERROR_MESSAGES = {
  DIGITS_ONLY: 'Must contain only numbers',
  UNIQUE_DIGITS: 'All digits must be unique',
  INVALID_LENGTH: (required) => `Must be exactly ${required} digits`,
  USERNAME_REQUIRED: 'Username is required',
  USERNAME_TOO_SHORT: `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`,
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
  NETWORK_ERROR: 'Network error. Please try again.',
  ROOM_NOT_FOUND: 'Room not found',
};

export const SUCCESS_MESSAGES = {
  ROOM_CREATED: 'Room created successfully',
  ROOM_JOINED: 'Joined room successfully',
  GAME_STARTED: 'Game started!',
};

// ═══════════════════════════════════════════════════════════
// RESULT ICONS
// ═══════════════════════════════════════════════════════════

export const RESULT_ICONS = {
  BULL: '🐂',
  COW: '🐮',
  MISS: '❌',
};

export const RESULT_TYPES = {
  BULL: 'bull',
  COW: 'cow',
  MISS: 'miss',
};

// ═══════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════

export const ROUTES = {
  HOME: '/home',
  AUTH: '/auth',
  PROFILE: '/profile',
  OFFLINE_SETUP: '/offline/setup',
  OFFLINE_GAME: '/offline/game',
  ONLINE_CREATE: '/online/create',
  ONLINE_JOIN: '/online/join',
  ONLINE_WAITING: '/online/waiting',
  ONLINE_GAME: '/online/game',
};

// ═══════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════

export const API_ENDPOINTS = {
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  ROOM_CREATE: '/match/create-room',
  ROOM_JOIN: '/match/join-room',
};
