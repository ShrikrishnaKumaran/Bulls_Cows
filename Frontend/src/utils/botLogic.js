/**
 * Bot Logic for Bulls & Cows
 * 
 * Two bot personalities:
 * - EASY (SURVIVOR): Random valid guesses, 20% chance to ignore clues
 * - HARD (DOMINATOR): Minimax-style, picks most informative guess
 */

import { calculateBullsAndCows } from './gameRules';

// ═══════════════════════════════════════════════════════════
// COMBINATION GENERATOR
// ═══════════════════════════════════════════════════════════

/**
 * Generate all valid combinations for a given digit count.
 * For 4 digits: 5040 combos (10P4)
 * For 3 digits: 720 combos (10P3)
 */
export const generateAllCombinations = (digits = 4) => {
  const results = [];
  const availableDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const permute = (current, remaining) => {
    if (current.length === digits) {
      results.push(current.join(''));
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      const next = remaining.slice();
      const digit = next.splice(i, 1)[0];
      permute([...current, digit], next);
    }
  };

  permute([], availableDigits);
  return results;
};

// ═══════════════════════════════════════════════════════════
// CANDIDATE FILTER
// ═══════════════════════════════════════════════════════════

/**
 * Filter candidates: keep only numbers that would produce
 * the same bulls/cows result if they were the secret.
 */
export const filterCandidates = (candidates, guess, feedback) => {
  return candidates.filter(candidate => {
    const result = calculateBullsAndCows(candidate, guess);
    return result.bulls === feedback.bulls && result.cows === feedback.cows;
  });
};

// ═══════════════════════════════════════════════════════════
// HARD MODE: MOST-INFORMATIVE-GUESS STRATEGY
// ═══════════════════════════════════════════════════════════

/**
 * For each possible guess, simulate all possible (bulls, cows) outcomes
 * and count how many candidates fall into each "bucket".
 * The best guess minimizes the size of the largest bucket (minimax).
 * 
 * To keep it fast, we only evaluate from the remaining candidates
 * (not all 5040) when the set is small enough.
 */
const scoreGuess = (guess, candidates) => {
  const buckets = {};
  for (const candidate of candidates) {
    const result = calculateBullsAndCows(candidate, guess);
    const key = `${result.bulls},${result.cows}`;
    buckets[key] = (buckets[key] || 0) + 1;
  }
  // Minimax: worst-case bucket size (lower is better)
  return Math.max(...Object.values(buckets));
};

/**
 * Pick the best guess using minimax strategy.
 * If candidates are few (≤ 500), evaluate all of them.
 * Otherwise sample a subset for speed + always evaluate remaining candidates.
 */
export const pickHardGuess = (candidates) => {
  if (candidates.length <= 2) {
    return candidates[0];
  }

  // For speed: evaluate from candidates only when set is manageable
  const evaluationSet = candidates.length <= 500 
    ? candidates 
    : candidates.slice(0, 300);

  let bestGuess = candidates[0];
  let bestScore = Infinity;

  for (const guess of evaluationSet) {
    const worstCase = scoreGuess(guess, candidates);
    if (worstCase < bestScore) {
      bestScore = worstCase;
      bestGuess = guess;
    }
    // Perfect score: evenly splits into single outcomes
    if (bestScore === 1) break;
  }

  return bestGuess;
};

// ═══════════════════════════════════════════════════════════
// EASY MODE: RANDOM + GLITCH STRATEGY
// ═══════════════════════════════════════════════════════════

const GLITCH_CHANCE = 0.2; // 20% chance to make a "brain fart"

/**
 * Pick a random element from an array.
 */
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Easy bot: mostly picks from filtered candidates,
 * but has a 20% chance to pick from the full set (simulating human error).
 */
export const pickEasyGuess = (candidates, allCombinations) => {
  const isBrainFart = Math.random() < GLITCH_CHANCE;

  if (isBrainFart && allCombinations.length > 0) {
    return pickRandom(allCombinations);
  }

  return pickRandom(candidates);
};

// ═══════════════════════════════════════════════════════════
// OPTIMAL FIRST GUESSES
// ═══════════════════════════════════════════════════════════

const OPTIMAL_STARTERS = {
  3: ['012', '013', '014', '102', '210'],
  4: ['0123', '0124', '1023', '1234', '0213'],
};

export const getFirstGuess = (digits, difficulty) => {
  if (difficulty === 'Hard') {
    return OPTIMAL_STARTERS[digits]?.[0] || '0123';
  }
  // Easy: random starter
  const starters = OPTIMAL_STARTERS[digits] || ['0123'];
  return pickRandom(starters);
};

// ═══════════════════════════════════════════════════════════
// BOT TAUNTS / CHAT MESSAGES
// ═══════════════════════════════════════════════════════════

export const BOT_NAMES = {
  Easy: 'SURVIVOR',
  Hard: 'DOMINATOR',
};

export const BOT_TAUNTS = {
  Easy: {
    thinking: [
      'Processing... beep boop...',
      'Recalibrating sensors...',
      'Consulting random number generator...',
      'Logic Processor Warming Up...',
      'Running ancient algorithms...',
    ],
    win: [
      'Wait... I won?! Error: Unexpected outcome.',
      'Even a broken clock is right twice a day!',
      'SYSTEM ALERT: Accidental Victory.',
    ],
    lose: [
      'Logic Processor Overheating...',
      'Error: Calculation Mismatch.',
      'Need more RAM... or luck.',
      'Task failed successfully.',
    ],
    guess: [
      'Hmm... maybe this?',
      'My circuits say try this...',
      'Rolling the dice...',
      '*sparks fly* Here goes...',
    ],
  },
  Hard: {
    thinking: [
      'Calculating optimal vector...',
      'Analyzing probability matrix...',
      'Cross-referencing data nodes...',
      'Running minimax protocol...',
      'Neural pathways locked.',
    ],
    win: [
      'Outcome Probable.',
      'Your defeat was calculated at 98%.',
      'As expected. Precision wins.',
      'Game over, human.',
    ],
    lose: [
      'Anomaly detected. Recalibrating...',
      'Improbable. Re-analyzing data...',
      'Your luck... is statistically insignificant.',
    ],
    guess: [
      'Probability locked.',
      'Vector confirmed.',
      'Deploying optimal sequence.',
      'Pattern recognized.',
    ],
  },
};

export const getRandomTaunt = (difficulty, category) => {
  const taunts = BOT_TAUNTS[difficulty]?.[category] || [];
  return taunts.length > 0 ? pickRandom(taunts) : '';
};
