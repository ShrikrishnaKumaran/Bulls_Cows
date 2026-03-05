/**
 * BotSetupPage - VS Bot Setup Wizard (Container)
 * 
 * 2-Step wizard:
 * Step 1: Configuration (digits, difficulty, format, bot difficulty)
 * Step 2: Player enters their secret code
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBotGameStore from '../../store/useBotGameStore';
import { TechTile } from '../../components/setup/TechTile';
import HoloSphereInput from '../../components/ui/HoloSphereInput';
import { BackIcon, HashIcon, ShieldCheckIcon, TimerIcon, TrophyIcon, LockIcon } from '../../components/setup/SetupIcons';

// ═══════════════════════════════════════════════════════════
// BOT DIFFICULTY ICONS
// ═══════════════════════════════════════════════════════════

const SurvivorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="9" cy="16" r="1" />
    <circle cx="15" cy="16" r="1" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <path d="M12 2v2" />
  </svg>
);

const DominatorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// BOT STEP INDICATOR
// ═══════════════════════════════════════════════════════════

const BotStepper = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'CONFIG' },
    { num: 2, label: 'YOUR CODE' },
  ];

  return (
    <div className="flex items-center justify-center mb-2 px-2">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                border-2 transition-all duration-300
                ${step.num === currentStep
                  ? 'bg-purple-500 text-white border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] ring-4 ring-purple-500/20'
                  : step.num < currentStep
                    ? 'bg-purple-500/40 text-purple-300 border-purple-500/60'
                    : 'bg-slate-800 text-slate-500 border-slate-600'
                }
              `}
            >
              {step.num < currentStep ? '✓' : step.num}
            </div>
            <span
              className={`
                text-[9px] mt-1 font-bold tracking-wider uppercase
                ${step.num === currentStep
                  ? 'text-purple-400'
                  : step.num < currentStep
                    ? 'text-purple-400/70'
                    : 'text-slate-500'
                }
              `}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="relative mx-3">
              <div className="w-16 sm:w-20 h-0.5 bg-slate-700" />
              {step.num < currentStep && (
                <div className="absolute top-0 left-0 w-full h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

function BotSetupPage() {
  const navigate = useNavigate();
  const {
    setupStep,
    config,
    setStep,
    setConfig,
    setPlayerSecret,
    startGame,
  } = useBotGameStore();

  const [currentSecret, setCurrentSecret] = useState('');
  const [error, setError] = useState('');

  const handleBack = () => {
    if (setupStep === 1) {
      navigate('/home');
    } else {
      setStep(1);
      setCurrentSecret('');
      setError('');
    }
  };

  const handleSubmitSecret = () => {
    const isValid = currentSecret.length === config.digits &&
      new Set(currentSecret.split('')).size === config.digits;

    if (!isValid) {
      setError('Please enter unique digits');
      return;
    }

    setPlayerSecret(currentSecret);
    const result = startGame();
    if (result.success) {
      navigate('/bot/game');
    } else {
      setError(result.error);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // STEP 1: CONFIGURATION
  // ═══════════════════════════════════════════════════════════
  if (setupStep === 1) {
    return (
      <div className="h-screen bg-[#111827] flex flex-col font-space overflow-hidden">
        <div className="scanlines" />
        <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-3 sm:px-4 h-full">
          {/* Header */}
          <header className="py-2 pt-4 flex items-center gap-3 shrink-0">
            <button
              onClick={handleBack}
              className="bg-white/5 p-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300"
            >
              <BackIcon />
            </button>
            <h1 className="text-base font-bold text-white tracking-wider uppercase">VS Bot Setup</h1>
          </header>

          <BotStepper currentStep={1} />

          <main className="flex-1 flex flex-col justify-evenly min-h-0 py-1">
            {/* Bot Difficulty */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Bot Model
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <TechTile
                  icon={<SurvivorIcon />}
                  label="SURVIVOR"
                  selected={config.botDifficulty === 'Easy'}
                  onClick={() => setConfig('botDifficulty', 'Easy')}
                  accentColor="green"
                />
                <TechTile
                  icon={<DominatorIcon />}
                  label="DOMINATOR"
                  selected={config.botDifficulty === 'Hard'}
                  onClick={() => setConfig('botDifficulty', 'Hard')}
                  accentColor="red"
                />
              </div>
              {/* Bot info */}

            </div>

            {/* Number of Digits */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Target Complexity
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <TechTile
                  icon={<HashIcon />}
                  label="3 Digits"
                  selected={config.digits === 3}
                  onClick={() => setConfig('digits', 3)}
                />
                <TechTile
                  icon={<HashIcon />}
                  label="4 Digits"
                  selected={config.digits === 4}
                  onClick={() => setConfig('digits', 4)}
                />
              </div>
            </div>

            {/* Difficulty (timer rules) */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Threat Level
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <TechTile
                  icon={<ShieldCheckIcon />}
                  label="Easy"
                  selected={config.difficulty === 'Easy'}
                  onClick={() => setConfig('difficulty', 'Easy')}
                  accentColor="green"
                />
                <TechTile
                  icon={<TimerIcon />}
                  label="Hard"
                  selected={config.difficulty === 'Hard'}
                  onClick={() => setConfig('difficulty', 'Hard')}
                  accentColor="red"
                />
              </div>
            </div>

            {/* Match Format */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Game Format
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <TechTile
                  icon={<TrophyIcon />}
                  label="BEST OF 1"
                  selected={config.format === 1}
                  onClick={() => setConfig('format', 1)}
                />
                <TechTile
                  icon={<TrophyIcon />}
                  label="Best of 3"
                  selected={config.format === 3}
                  onClick={() => setConfig('format', 3)}
                />
                <TechTile
                  icon={<TrophyIcon />}
                  label="Best of 5"
                  selected={config.format === 5}
                  onClick={() => setConfig('format', 5)}
                />
              </div>
            </div>

            {/* System Terminal */}
            <div className="bg-black/50 border-l-4 border-purple-500 p-2.5 rounded-r-lg font-mono text-[10px]">
              <div className="text-purple-500/60 mb-1">{`> BOT_INIT_SEQUENCE...`}</div>
              <div className="text-purple-400/80 space-y-0.5">
                <p>
                  {`> MODEL: `}
                  <span className={config.botDifficulty === 'Hard' ? 'text-red-400' : 'text-green-400'}>
                    {config.botDifficulty === 'Hard' ? 'DOMINATOR' : 'SURVIVOR'}
                  </span>
                  {config.botDifficulty === 'Hard'
                    ? ' (Minimax Protocol)'
                    : ' (Random Walker)'}
                </p>
                <p>
                  {`> TIMER: `}
                  <span className={config.difficulty === 'Hard' ? 'text-red-400' : 'text-green-400'}>
                    {config.difficulty === 'Hard' ? '30s LIMIT' : 'DISABLED'}
                  </span>
                </p>
                <p>
                  {`> TARGET: `}
                  <span className="text-white">{config.digits}-DIGIT</span>
                  {' CODE SEQUENCE'}
                </p>
                <p>
                  {`> FORMAT: `}
                  <span className="text-white">
                    {config.format === 1 ? 'SINGLE MATCH' : `BEST OF ${config.format}`}
                  </span>
                </p>
              </div>
              <div className="text-purple-500/40 mt-1">{`> AWAITING_TARGET_CODE...`}</div>
            </div>
          </main>

          {/* Footer — pinned */}
          <footer className="shrink-0 py-3">
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-purple-500 text-white font-bold text-sm uppercase tracking-widest 
                shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:translate-y-[-2px] 
                transition-all duration-200 active:scale-[0.98]">
              ⚡ Set Your Code
            </button>
          </footer>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 2: SECRET ENTRY
  // ═══════════════════════════════════════════════════════════
  const hasDuplicates = (() => {
    if (!currentSecret || currentSecret.length !== config.digits) return false;
    return new Set(currentSecret.split('')).size !== currentSecret.length;
  })();

  const isValidSecret = currentSecret.length === config.digits && !hasDuplicates;

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col font-space overflow-hidden">
      <div className="scanlines" />
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-3 sm:px-4">
        <header className="py-4 pt-8 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="bg-white/5 p-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300"
          >
            <BackIcon />
          </button>
          <h1 className="text-lg font-bold text-white tracking-wider uppercase">
            Your Secret Code
          </h1>
        </header>

        <BotStepper currentStep={2} />

        <main className="flex-1 flex flex-col justify-center py-2">
          {/* The Master Container */}
          <div className="w-full max-w-sm mx-auto bg-[#1f2937] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="bg-slate-800 p-6 border-b border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <LockIcon />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Secure Vault</h3>
                  <p className="text-slate-400 text-xs">
                    Enter your {config.digits}-digit secret code
                  </p>
                </div>
              </div>

              {/* Mission Summary */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-black/30 rounded-lg p-2 text-center">
                  <div className="text-[9px] text-slate-500 uppercase mb-0.5">Digits</div>
                  <div className="text-sm font-bold text-white">{config.digits}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 text-center">
                  <div className="text-[9px] text-slate-500 uppercase mb-0.5">Bot</div>
                  <div className={`text-sm font-bold ${config.botDifficulty === 'Hard' ? 'text-red-400' : 'text-green-400'}`}>
                    {config.botDifficulty === 'Hard' ? 'DOMINATOR' : 'SURVIVOR'}
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 text-center">
                  <div className="text-[9px] text-slate-500 uppercase mb-0.5">Format</div>
                  <div className="text-sm font-bold text-white">
                    {config.format === 1 ? '1' : `Bo${config.format}`}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Input Section */}
            <div className="p-4 sm:p-6">
              <HoloSphereInput
                value={currentSecret}
                onChange={setCurrentSecret}
                digits={config.digits}
              />

              {/* Error / Duplicate Warning */}
              {(error || hasDuplicates) && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-xs text-center font-medium">
                    {error || 'All digits must be unique!'}
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <button
                onClick={handleSubmitSecret}
                disabled={!isValidSecret}
                className={`
                  w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest
                  transition-all duration-200 active:scale-[0.98]
                  ${isValidSecret
                    ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                `}
              >
                🤖 Launch Bot Match
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BotSetupPage;
