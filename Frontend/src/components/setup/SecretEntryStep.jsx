/**
 * SecretEntryStep - Secret Code Entry Step
 * 
 * Used for both Step 2 (Player 1) and Step 4 (Player 2).
 * Secure Vault Interface with:
 * - HoloSphereInput for digit selection
 * - Mission Summary HUD
 * - Unified "Hardware Unit" design
 */
import { useMemo } from 'react';
import SetupStepper from './SetupStepper';
import HoloSphereInput from '../ui/HoloSphereInput';
import { BackIcon, LockIcon } from './SetupIcons';

// Icons for summary panel
const Hash = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const Trophy = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const Timer = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2" />
    <path d="m5 3-1 1" />
    <path d="m19 3 1 1" />
    <path d="M9 1h6" />
  </svg>
);

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
          {/* The Master Container - Single Unified Panel */}
          <div className="w-full max-w-sm mx-auto bg-[#1f2937] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Section 1: The Header (Mission Briefing) */}
            <div className="bg-slate-800 p-6 border-b border-white/5">
              <div className="text-white font-bold uppercase tracking-widest text-sm mb-4">
                Agent {playerNumber}, Enter Your Number
              </div>
              <div className="text-xs font-mono">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <Hash size={14} className="text-slate-500" />
                    <span className="text-slate-400">TARGET:</span>{' '}
                    <span className="text-primary">{config.digits}-DIGIT</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy size={14} className="text-slate-500" />
                    <span className="text-slate-400">PROTOCOL:</span>{' '}
                    <span className="text-white">{config.format === 1 ? 'SINGLE' : `BO${config.format}`}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-slate-700/30">
                  <Timer size={14} className={config.difficulty === 'Easy' ? 'text-green-400' : 'text-red-400'} />
                  <span className={config.difficulty === 'Easy' ? 'text-green-400' : 'text-red-400'}>
                    {config.difficulty === 'Easy' 
                      ? 'NO TIMER • FULL HISTORY' 
                      : '30s TIMER • LAST 5 GUESSES ONLY'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: The Body (Input) */}
            <div className="bg-[#111827] p-6">
              <div className="text-center text-slate-500 text-[10px] font-mono tracking-widest mb-4">
                SET SECURITY CODE
              </div>
              <HoloSphereInput
                length={config.digits}
                onChange={onSecretChange}
                value={currentSecret}
              />
            </div>

            {/* Error Display (Integrated Red Pulse Bar) */}
            {(hasDuplicates || error) && (
              <div className="bg-red-500/10 text-red-400 text-xs font-mono py-2 text-center border-t border-red-500/20">
                {hasDuplicates ? 'ERR: DUPLICATE_DIGITS_DETECTED' : error}
              </div>
            )}

            {/* Section 3: The Footer (Button) */}
            <button
              onClick={onSubmit}
              disabled={!isValidSecret || error}
              className={`
                w-full py-4 font-bold uppercase tracking-widest transition-all
                ${isValidSecret && !error && !hasDuplicates
                  ? 'bg-primary hover:bg-yellow-400 text-black'
                  : 'bg-slate-800 text-slate-500'
                }
              `}
            >
              ENCRYPT & LOCK IN
            </button>
          </div>

        </main>

        {/* Tech Border Footer */}
        <div className="mt-auto pt-6 pb-4 px-4 flex justify-between items-end">
          <div className="h-14 w-14 border-l-2 border-b-2 border-white/20 rounded-bl-xl"></div>
          <div className="font-mono text-[10px] text-center text-primary/60 pb-2">
            TIP: Avoid predictable sequences to keep your number challenging
          </div>
          <div className="h-14 w-14 border-r-2 border-b-2 border-white/20 rounded-br-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default SecretEntryStep;
