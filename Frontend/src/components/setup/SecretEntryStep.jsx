/**
 * SecretEntryStep - Secret Code Entry Step
 * 
 * Used for both Step 2 (Player 1) and Step 4 (Player 2).
 * Secure Vault Interface with:
 * - CyberDrumInput for digit selection
 * - Mission Summary HUD
 * - Validation status display
 */
import { useMemo } from 'react';
import SetupStepper from './SetupStepper';
import CyberDrumInput from '../ui/CyberDrumInput';
import { BackIcon, LockIcon } from './SetupIcons';

const SecretEntryStep = ({
  playerNumber, // 1 or 2
  config,
  currentSecret,
  onSecretChange,
  onSubmit,
  onBack,
  error
}) => {
  const isPlayer1 = playerNumber === 1;
  const stepNumber = isPlayer1 ? 2 : 4;
  
  // Check for duplicate digits
  const hasDuplicates = useMemo(() => {
    if (!currentSecret || currentSecret.length !== config.digits) return false;
    const digits = currentSecret.split('');
    return new Set(digits).size !== digits.length;
  }, [currentSecret, config.digits]);

  const isValidSecret = currentSecret.length === config.digits && !hasDuplicates;

  // Player-specific colors
  const accentBg = isPlayer1 ? 'bg-primary/10' : 'bg-blue-500/10';
  const accentBorder = isPlayer1 ? 'border-primary/30' : 'border-blue-500/30';
  const accentText = isPlayer1 ? 'text-primary' : 'text-blue-400';

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col font-space overflow-hidden">
      <div className="scanlines" />
      
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-3 sm:px-4">
        <header className="py-4 pt-8 flex items-center gap-4">
          {isPlayer1 ? (
            <button
              onClick={onBack}
              className="bg-white/5 p-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300"
            >
              <BackIcon />
            </button>
          ) : (
            <div className="w-9" /> // Spacer for Player 2 (no back button)
          )}
          <h1 className="text-lg font-bold text-white tracking-wider uppercase">
            Agent {playerNumber} Setup
          </h1>
        </header>

        <SetupStepper currentStep={stepNumber} />

        <main className="flex-1 flex flex-col justify-center py-2">
          {/* Secure Vault Header - Compact */}
          <div className="text-center mb-4">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${accentBg} border ${accentBorder} flex items-center justify-center ${accentText}`}>
              <LockIcon />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-1">
              Secure Your Data
            </h2>
            <p className="text-slate-400 text-xs">
              Agent {playerNumber}, initialize your secret sequence
            </p>
          </div>

          {/* Mission Summary HUD */}
          <div className="bg-surface-dark/50 border border-slate-700/50 rounded-lg p-3 mb-4 text-xs font-mono">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-slate-400">TARGET:</span>{' '}
                <span className="text-primary">{config.digits}-DIGIT</span>
              </div>
              <div>
                <span className="text-slate-400">PROTOCOL:</span>{' '}
                <span className="text-white">{config.format === 1 ? 'SINGLE' : `BO${config.format}`}</span>
              </div>
            </div>
            <div className="text-center pt-2 border-t border-slate-700/30">
              <span className={config.difficulty === 'Easy' ? 'text-green-400' : 'text-red-400'}>
                {config.difficulty === 'Easy' 
                  ? '⏱ NO TIMER • FULL HISTORY' 
                  : '⏱ 30s TIMER • LAST 5 GUESSES ONLY'}
              </span>
            </div>
          </div>

          {/* Drum Input Container - Vault Style */}
          <div className="border-2 border-dashed border-slate-700/50 p-4 rounded-2xl bg-black/30 mb-4">
            <CyberDrumInput
              length={config.digits}
              value={currentSecret}
              onChange={onSecretChange}
            />
          </div>

          {/* Status Line - Sleek Terminal Style */}
          <div className="flex items-center justify-center gap-2 mb-4 font-mono text-xs">
            {hasDuplicates ? (
              <>
                <span className="text-red-500 animate-pulse">⚠</span>
                <span className="text-red-400 tracking-widest">ERR: DUPLICATE_DIGITS_DETECTED</span>
              </>
            ) : isValidSecret ? (
              <>
                <span className="text-green-400">✓</span>
                <span className="text-green-400 tracking-widest">SEQ: VALIDATED</span>
              </>
            ) : (
              <>
                <span className="text-slate-500">○</span>
                <span className="text-slate-500 tracking-widest">AWAITING_INPUT...</span>
              </>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center mb-3 font-mono">{error}</p>
          )}

          {/* Action Button - Solid Neon */}
          <button
            onClick={onSubmit}
            disabled={!isValidSecret}
            className={`
              w-full py-4 rounded-xl font-bold text-sm uppercase tracking-[0.2em]
              transition-all duration-200 active:scale-[0.98]
              ${isValidSecret
                ? 'bg-primary text-black shadow-[0_0_25px_rgba(250,204,20,0.4)] hover:shadow-[0_0_35px_rgba(250,204,20,0.6)] hover:translate-y-[-2px]'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }
            `}
          >
            {isPlayer1 ? '🔒 Encrypt & Lock In' : '🎮 Encrypt & Start Game'}
          </button>
        </main>
      </div>
    </div>
  );
};

export default SecretEntryStep;
