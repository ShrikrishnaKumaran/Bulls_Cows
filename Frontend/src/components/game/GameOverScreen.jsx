/**
 * GameOverScreen - Victory/Defeat Screen Component
 * 
 * Displayed when a game ends, showing:
 * - Winner announcement with trophy animation
 * - Final score
 * - Play Again and Quit buttons
 */

// Trophy Icon
const TrophyIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.937 6.937 0 006.215 6.215.75.75 0 00.859-.584c.213-1.012.395-2.036.543-3.071h.858c.148 1.035.33 2.059.543 3.071a.75.75 0 00.859.584 6.937 6.937 0 006.215-6.215.75.75 0 00-.584-.859c-1.012-.213-2.036-.395-3.071-.543v-.858a.75.75 0 00-.75-.75H5.916a.75.75 0 00-.75.75zm11.334 5.379c0 2.9-2.35 5.25-5.25 5.25S6 10.9 6 8V3.75h10.5V8z" clipRule="evenodd" />
    <path d="M6.75 18.75a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zM8.25 21a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z" />
  </svg>
);

const GameOverScreen = ({
  winner,
  myName,
  opponentName,
  score,
  onPlayAgain,
  onQuit
}) => {
  const winnerIsMe = winner === 'me' || winner === 'PLAYER_1';
  const winnerName = winnerIsMe ? myName : opponentName;

  return (
    <div className="min-h-screen bg-background-dark flex flex-col font-space relative overflow-hidden">
      {/* Scanlines Overlay */}
      <div className="scanlines" />

      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4">
        {/* Trophy */}
        <div className="text-primary mb-6 animate-bounce drop-shadow-[0_0_25px_rgba(250,204,20,0.6)]">
          <TrophyIcon className="w-24 h-24" />
        </div>

        {/* Winner Text */}
        <h2 className="text-3xl font-bold text-white text-center mb-2 glitch-text">
          {winnerName} WINS!
        </h2>
        <p className="text-slate-400 text-center mb-8">
          🎉 {winnerIsMe ? 'Congratulations!' : 'Better luck next time!'}
        </p>

        {/* Stats */}
        <div className="w-full bg-surface-dark/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 mb-8 shadow-xl shadow-black/30">
          <div className="text-center text-slate-400 text-sm mb-2">Final Score</div>
          <div className="text-center text-2xl font-bold text-white font-mono">
            {score}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 rounded-full bg-primary text-black font-bold text-lg shadow-neon hover:shadow-neon-strong hover:bg-yellow-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            🔄 Play Again
          </button>
          <button
            onClick={onQuit}
            className="w-full py-3 rounded-full bg-surface-dark/80 backdrop-blur-sm text-slate-300 font-semibold border border-slate-700/50 hover:bg-slate-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/30"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
