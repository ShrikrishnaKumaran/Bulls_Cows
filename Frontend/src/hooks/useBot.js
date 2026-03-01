/**
 * useBot - React Hook for Bot Opponent Logic
 * 
 * Manages the bot's internal state (candidate list),
 * provides a `makeMove` function that returns a guess after a simulated delay,
 * and handles the "thinking" UX.
 */
import { useState, useCallback, useRef } from 'react';
import {
  generateAllCombinations,
  filterCandidates,
  pickHardGuess,
  pickEasyGuess,
  getFirstGuess,
} from '../utils/botLogic';

// Thinking delay range in ms
const THINKING_DELAY = {
  Easy: { min: 1500, max: 3000 },
  Hard: { min: 1000, max: 2000 },
};

const useBot = (difficulty = 'Easy', digits = 4) => {
  const allCombinations = useRef(generateAllCombinations(digits));
  const [candidates, setCandidates] = useState(() => generateAllCombinations(digits));
  const [isThinking, setIsThinking] = useState(false);
  const moveCountRef = useRef(0);
  const lastBotGuessRef = useRef(null);

  /**
   * Reset the bot (new game/round).
   */
  const resetBot = useCallback(() => {
    const combos = generateAllCombinations(digits);
    allCombinations.current = combos;
    setCandidates(combos);
    moveCountRef.current = 0;
    lastBotGuessRef.current = null;
    setIsThinking(false);
  }, [digits]);

  /**
   * Process incoming feedback from the bot's last guess
   * and return the next guess after a simulated delay.
   * 
   * @param {object|null} lastFeedback - { bulls, cows } from bot's last guess, null for first move
   * @returns {Promise<string>} - The bot's next guess
   */
  const makeMove = useCallback((lastFeedback) => {
    return new Promise((resolve) => {
      setIsThinking(true);

      // Simulate thinking delay
      const delay = THINKING_DELAY[difficulty] || THINKING_DELAY.Easy;
      const thinkTime = Math.random() * (delay.max - delay.min) + delay.min;

      setTimeout(() => {
        let currentCandidates = candidates;

        // Filter candidates based on feedback from bot's previous guess
        if (lastFeedback && lastBotGuessRef.current) {
          currentCandidates = filterCandidates(
            currentCandidates,
            lastBotGuessRef.current,
            lastFeedback
          );
          setCandidates(currentCandidates);
        }

        let guess;
        moveCountRef.current += 1;

        // First move: use optimal/random starter
        if (moveCountRef.current === 1) {
          guess = getFirstGuess(digits, difficulty);
        } else if (currentCandidates.length === 0) {
          // Fallback: shouldn't happen, but pick random from all
          guess = allCombinations.current[
            Math.floor(Math.random() * allCombinations.current.length)
          ];
        } else if (difficulty === 'Hard') {
          guess = pickHardGuess(currentCandidates);
        } else {
          guess = pickEasyGuess(currentCandidates, allCombinations.current);
        }

        lastBotGuessRef.current = guess;
        setIsThinking(false);
        resolve(guess);
      }, thinkTime);
    });
  }, [candidates, difficulty, digits]);

  return {
    makeMove,
    resetBot,
    isThinking,
    candidatesLeft: candidates.length,
  };
};

export default useBot;
