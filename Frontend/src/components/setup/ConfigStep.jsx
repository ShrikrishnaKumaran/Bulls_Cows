/**
 * ConfigStep - Game Configuration Step
 * 
 * Step 1 of the setup wizard: "Mission Briefing Console"
 * Handles selection of:
 * - Number of digits (3 or 4)
 * - Difficulty (Easy or Hard)
 * - Match format (1 Round, BO3, BO5)
 */
import SetupStepper from './SetupStepper';
import { TechTile } from './TechTile';
import { BackIcon, HashIcon, ShieldCheckIcon, TimerIcon, TrophyIcon } from './SetupIcons';

const ConfigStep = ({ 
  config, 
  onConfigChange, 
  onBack, 
  onNext 
}) => {
  return (
    <div className="min-h-screen bg-[#111827] flex flex-col font-space overflow-hidden">
      <div className="scanlines" />
      
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-3 sm:px-4">
        {/* Header */}
        <header className="py-2 pt-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="bg-white/5 p-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300"
          >
            <BackIcon />
          </button>
          <h1 className="text-base font-bold text-white tracking-wider uppercase">Mission Briefing</h1>
        </header>

        {/* Progress Line Stepper */}
        <SetupStepper currentStep={1} />

        <main className="flex-1 overflow-y-auto pb-2">
          {/* Section: Number of Digits */}
          <div className="mb-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Target Complexity
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <TechTile
                icon={<HashIcon />}
                label="3 Digits"
                selected={config.digits === 3}
                onClick={() => onConfigChange('digits', 3)}
              />
              <TechTile
                icon={<HashIcon />}
                label="4 Digits"
                selected={config.digits === 4}
                onClick={() => onConfigChange('digits', 4)}
              />
            </div>
          </div>

          {/* Section: Difficulty */}
          <div className="mb-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Threat Level
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <TechTile
                icon={<ShieldCheckIcon />}
                label="Easy"
                selected={config.difficulty === 'Easy'}
                onClick={() => onConfigChange('difficulty', 'Easy')}
                accentColor="green"
              />
              <TechTile
                icon={<TimerIcon />}
                label="Hard"
                selected={config.difficulty === 'Hard'}
                onClick={() => onConfigChange('difficulty', 'Hard')}
                accentColor="red"
              />
            </div>
          </div>

          {/* Section: Match Format */}
          <div className="mb-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Game Format
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <TechTile
                icon={<TrophyIcon />}
                label="BEST OF 1"
                selected={config.format === 1}
                onClick={() => onConfigChange('format', 1)}
              />
              <TechTile
                icon={<TrophyIcon />}
                label="Best of 3"
                selected={config.format === 3}
                onClick={() => onConfigChange('format', 3)}
              />
              <TechTile
                icon={<TrophyIcon />}
                label="Best of 5"
                selected={config.format === 5}
                onClick={() => onConfigChange('format', 5)}
              />
            </div>
          </div>

          {/* System Terminal - Info Panel */}
          <div className="bg-black/50 border-l-4 border-primary p-2.5 rounded-r-lg font-mono text-[10px]">
            <div className="text-primary/60 mb-1">{`> SYSTEM_CHECK_INIT...`}</div>
            <div className="text-primary/80 space-y-0.5">
              <p>
                {`> MODE: `}
                <span className={config.difficulty === 'Hard' ? 'text-red-400' : 'text-green-400'}>
                  {config.difficulty.toUpperCase()}
                </span>
                {config.difficulty === 'Hard' 
                  ? ' (30s Timer + 5 History)' 
                  : ' (No Timer + Full History)'}
              </p>
              <p>
                {`> TARGET: `}
                <span className="text-white">{config.digits}-DIGIT</span>
                {' CODE SEQUENCE'}
              </p>
              <p>
                {`> PROTOCOL: `}
                <span className="text-white">
                  {config.format === 1 ? 'SINGLE MATCH' : `BEST OF ${config.format}`}
                </span>
              </p>
            </div>
            <div className="text-primary/40 mt-1">{`> READY_FOR_DEPLOYMENT...`}</div>
          </div>
        </main>

        {/* Cyber Launch Button */}
        <footer className="py-3">
          <button
            onClick={onNext}
            className="w-full py-3 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-widest 
              shadow-neon hover:shadow-neon-strong hover:translate-y-[-2px] 
              transition-all duration-200 active:scale-[0.98]"
          >
            🚀 Initialize Mission
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfigStep;
