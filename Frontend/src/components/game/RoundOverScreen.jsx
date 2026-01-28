/**
 * RoundOverScreen - Displayed between rounds in Best of 3/5 mode
 * Shows round winner and prompts to continue to next round
 */
import { memo } from 'react';
import { Button } from '../ui';

function RoundOverScreen({
  roundWinner,
  winnerName,
  loserName,
  currentScore,
  currentRound,
  totalRounds,
  onContinue
}) {
  const winnerIsPlayer1 = roundWinner === 'PLAYER_1';

  return (
    <div className="fixed inset-0 bg-background-dark font-space flex items-center justify-center">
      {/* Scanlines Overlay */}
      <div className="scanlines" />

      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Card Container */}
        <div className="bg-surface-dark/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 shadow-2xl shadow-primary/10">
          
          {/* Round Complete Badge */}
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
              <span className="text-primary text-sm font-bold tracking-wider">
                ROUND {currentRound} COMPLETE
              </span>
            </div>
          </div>

          {/* Winner Announcement */}
          <div className="text-center mb-8">
            <h2 className={`text-4xl font-bold mb-2 ${winnerIsPlayer1 ? 'text-primary' : 'text-blue-400'}`}>
              {winnerName}
            </h2>
            <p className="text-2xl text-white font-semibold">
              WINS ROUND {currentRound}!
            </p>
          </div>

          {/* Current Score */}
          <div className="mb-8 py-4 px-6 bg-black/30 rounded-xl border border-primary/10">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">CURRENT SCORE</p>
              <p className="text-4xl font-bold text-white">
                {currentScore}
              </p>
            </div>
          </div>

          {/* Next Round Info */}
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-center text-orange-300 text-sm">
              <span className="font-bold">{loserName}</span> will make the first guess in Round {currentRound + 1}
            </p>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onContinue}
            variant="primary"
            className="w-full py-4 text-lg font-bold"
          >
            CONTINUE TO ROUND {currentRound + 1}
          </Button>

          {/* Progress Indicator */}
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: totalRounds }, (_, i) => {
              const roundNum = i + 1;
              const isComplete = roundNum <= currentRound;
              return (
                <div
                  key={roundNum}
                  className={`w-3 h-3 rounded-full ${
                    isComplete ? 'bg-primary' : 'bg-slate-700'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(RoundOverScreen);
