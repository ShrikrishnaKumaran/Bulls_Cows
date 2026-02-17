/**
 * GameOverScreen - Victory/Defeat Screen Component
 * Pure presentation component for game end state
 */
import { memo } from 'react';

// Trophy Icon
const TrophyIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.937 6.937 0 006.215 6.215.75.75 0 00.859-.584c.213-1.012.395-2.036.543-3.071h.858c.148 1.035.33 2.059.543 3.071a.75.75 0 00.859.584 6.937 6.937 0 006.215-6.215.75.75 0 00-.584-.859c-1.012-.213-2.036-.395-3.071-.543v-.858a.75.75 0 00-.75-.75H5.916a.75.75 0 00-.75.75zm11.334 5.379c0 2.9-2.35 5.25-5.25 5.25S6 10.9 6 8V3.75h10.5V8z" clipRule="evenodd" />
    <path d="M6.75 18.75a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zM8.25 21a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z" />
  </svg>
);

const GameOverScreen = ({
  winnerName,
  winnerIsMe,
  score,
  onPlayAgain,
  onQuit
}) => {

  return (
    <div className="min-h-screen bg-background-dark flex flex-col font-space relative overflow-hidden">
      {/* Scanlines Overlay */}
      <div className="scanlines" />

      {/* Enhanced Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full px-3">
        {/* Main Card Container */}
        <div className="w-full bg-gradient-to-b from-surface-dark/95 to-surface-dark/80 backdrop-blur-xl rounded-2xl border-2 border-primary/30 shadow-2xl shadow-primary/20 p-5 relative overflow-hidden">
          {/* Glow effect on card edges */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Trophy */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute inset-0 -m-3 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative text-primary drop-shadow-[0_0_20px_rgba(250,204,20,0.8)] animate-bounce">
                  <TrophyIcon className="w-16 h-16" />
                </div>
              </div>
            </div>

            {/* Victory Badge */}
            <div className="text-center mb-4">
              <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/40 rounded-full backdrop-blur-sm mb-2">
                <span className="text-primary text-xs font-bold tracking-widest uppercase">
                  ⚡ Victory ⚡
                </span>
              </div>
            </div>

            {/* Winner Text */}
            <h2 className="text-2xl font-bold text-center mb-1 bg-gradient-to-r from-primary via-yellow-300 to-primary bg-clip-text text-transparent">
              {winnerName}
            </h2>
            <p className="text-lg font-bold text-white text-center mb-1">
              WINS THE MATCH!
            </p>
            <p className="text-sm text-center mb-4">
              <span className={winnerIsMe ? 'text-green-400' : 'text-blue-400'}>
                {winnerIsMe ? '🎊 Outstanding!' : '💪 Well Played!'}
              </span>
            </p>

            {/* Stats Card */}
            <div className="mb-5 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-inner">
              <div className="text-center text-slate-400 text-xs mb-2 uppercase tracking-wider font-semibold">Final Score</div>
              <div className="text-center text-3xl font-bold text-white font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                {score}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={onPlayAgain}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary via-yellow-400 to-primary text-black font-bold text-sm shadow-[0_0_20px_rgba(250,204,20,0.5)] hover:shadow-[0_0_30px_rgba(250,204,20,0.8)] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative">🔄 Play Again</span>
              </button>
              <button
                onClick={onQuit}
                className="w-full py-3 rounded-xl bg-surface-dark/60 backdrop-blur-sm text-slate-300 font-semibold text-sm border border-slate-600/50 hover:bg-slate-700/80 hover:border-slate-500 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-black/30 flex items-center justify-center gap-2"
              >
                <span>🏠 Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(GameOverScreen);
