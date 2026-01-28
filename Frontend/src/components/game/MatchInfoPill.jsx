/**
 * MatchInfoPill - Game match info display
 * Shows current match number, score, and difficulty
 */
import { memo } from 'react';

const MatchInfoPill = ({ currentMatch, totalMatches, score, difficulty }) => {
  // Color code difficulty
  const difficultyColor = difficulty === 'Hard' ? 'text-red-400' : 'text-green-400';
  
  return (
    <div className="flex justify-center mb-4">
      <div className="bg-surface-dark/80 backdrop-blur-sm border border-slate-700/50 rounded-full px-4 py-2 text-xs font-bold tracking-wider text-slate-300 flex items-center gap-2 shadow-lg shadow-black/30">
        <span>MATCH: {currentMatch} of {totalMatches}</span>
        <span className="text-slate-600">|</span>
        <span>{score}</span>
        <span className="text-slate-600">|</span>
        <span className={difficultyColor}>{difficulty.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default memo(MatchInfoPill);
