/**
 * PassAndPlaySetup - Offline Mode Setup Wizard
 * 
 * 4-Step wizard for setting up a local multiplayer game:
 * Step 1: Configuration (digits, difficulty)
 * Step 2: Player 1 enters secret
 * Step 3: Handover screen (pass device)
 * Step 4: Player 2 enters secret
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOfflineGameStore from '../store/useOfflineGameStore';
import ConfigSelector from './ui/ConfigSelector';
import CyberNumpad from './ui/CyberNumpad';

// ═══════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
  </svg>
);

const HandoverIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20">
    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577A11.217 11.217 0 0112 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
    <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
    <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// SECRET DISPLAY COMPONENT
// ═══════════════════════════════════════════════════════════

const SecretDisplay = ({ secret, digits, showSecret, onToggle }) => {
  const slots = Array.from({ length: digits }, (_, i) => secret[i] || null);
  
  return (
    <div className="mb-8">
      {/* Secret Slots */}
      <div className="flex justify-center gap-3 mb-4">
        {slots.map((digit, i) => (
          <div
            key={i}
            className={`
              w-14 h-16 rounded-xl border-2 flex items-center justify-center
              text-2xl font-bold font-mono transition-all duration-200
              ${digit 
                ? 'bg-[#1f2937] border-primary text-primary' 
                : 'bg-slate-800/50 border-slate-600 text-slate-500'
              }
            `}
          >
            {digit ? (showSecret ? digit : '•') : '_'}
          </div>
        ))}
      </div>
      
      {/* Show/Hide Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 mx-auto text-sm text-slate-400 hover:text-white transition-colors"
      >
        {showSecret ? <EyeSlashIcon /> : <EyeIcon />}
        <span>{showSecret ? 'Hide' : 'Show'}</span>
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// STEP INDICATOR
// ═══════════════════════════════════════════════════════════

const StepIndicator = ({ currentStep, totalSteps = 4 }) => (
  <div className="flex justify-center gap-2 mb-6">
    {Array.from({ length: totalSteps }, (_, i) => (
      <div
        key={i}
        className={`
          w-2 h-2 rounded-full transition-all duration-300
          ${i + 1 === currentStep 
            ? 'w-6 bg-primary' 
            : i + 1 < currentStep 
              ? 'bg-primary/50' 
              : 'bg-slate-600'
          }
        `}
      />
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

function PassAndPlaySetup() {
  const navigate = useNavigate();
  
  // Store
  const { 
    setupStep, 
    config, 
    setStep, 
    setConfig, 
    setSecret,
    setDigits,
    startGame
  } = useOfflineGameStore();
  
  // Local state
  const [currentSecret, setCurrentSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');

  // ─── HANDLERS ───
  
  const handleBack = () => {
    if (setupStep === 1) {
      navigate('/');
    } else if (setupStep === 2) {
      setStep(1);
      setCurrentSecret('');
    }
  };

  const handleDigit = (digit) => {
    if (currentSecret.length < config.digits && !currentSecret.includes(digit)) {
      setCurrentSecret(prev => prev + digit);
      setError('');
    }
  };

  const handleClear = () => {
    if (currentSecret.length > 0) {
      setCurrentSecret(prev => prev.slice(0, -1));
    } else {
      setCurrentSecret('');
    }
    setError('');
  };

  const handleP1Submit = () => {
    if (currentSecret.length !== config.digits) {
      setError(`Please enter ${config.digits} digits`);
      return;
    }
    
    setSecret(1, currentSecret);
    setCurrentSecret('');
    setShowSecret(false);
    setStep(3); // Go to handover
  };

  const handleP2Submit = () => {
    if (currentSecret.length !== config.digits) {
      setError(`Please enter ${config.digits} digits`);
      return;
    }
    
    setSecret(2, currentSecret);
    setDigits(config.digits);
    
    const result = startGame();
    if (result.success) {
      navigate('/offline/game');
    } else {
      setError(result.error);
    }
  };

  const handleHandoverReady = () => {
    setStep(4);
    setCurrentSecret('');
    setShowSecret(false);
  };

  // ─── RENDER STEPS ───

  // Step 1: Configuration
  if (setupStep === 1) {
    return (
      <div className="min-h-screen bg-[#111827] flex flex-col font-space">
        <div className="scanlines" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-4">
          {/* Header */}
          <header className="py-6 pt-10 flex items-center gap-4">
            <button
              onClick={handleBack}
              className="bg-white/5 p-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300"
            >
              <BackIcon />
            </button>
            <h1 className="text-xl font-bold text-white">Game Setup</h1>
          </header>

          {/* Step Indicator */}
          <StepIndicator currentStep={1} />

          {/* Content */}
          <main className="flex-1 py-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Configure Game</h2>
              <p className="text-slate-400 text-sm">Choose your game settings</p>
            </div>

            {/* Config Options */}
            <ConfigSelector
              label="Number of Digits"
              options={[3, 4]}
              value={config.digits}
              onChange={(val) => setConfig('digits', val)}
              renderOption={(opt) => `${opt} Digits`}
            />

            <ConfigSelector
              label="Difficulty"
              options={['Easy', 'Hard']}
              value={config.difficulty}
              onChange={(val) => setConfig('difficulty', val)}
            />

            <ConfigSelector
              label="Match Format"
              options={[1, 3, 5]}
              value={config.format}
              onChange={(val) => setConfig('format', val)}
              renderOption={(opt) => opt === 1 ? 'Single' : `Best of ${opt}`}
            />

            {/* Info Box */}
            <div className="bg-[#1f2937] rounded-xl p-4 border border-slate-700 mt-6 space-y-2">
              <p className="text-slate-400 text-sm">
                <span className="text-primary font-semibold">Easy:</span> Unlimited guesses
              </p>
              <p className="text-slate-400 text-sm">
                <span className="text-primary font-semibold">Hard:</span> Limited to 10 guesses
              </p>
              <p className="text-slate-400 text-sm">
                <span className="text-primary font-semibold">Format:</span> {config.format === 1 ? 'Single game decides winner' : `First to ${Math.ceil(config.format / 2)} wins`}
              </p>
            </div>
          </main>

          {/* Footer */}
          <footer className="py-6">
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-xl bg-primary text-black font-bold text-lg shadow-neon hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              Continue
            </button>
          </footer>
        </div>
      </div>
    );
  }

  // Step 2: Player 1 Secret Entry
  if (setupStep === 2) {
    return (
      <div className="min-h-screen bg-[#111827] flex flex-col font-space">
        <div className="scanlines" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-4">
          {/* Header */}
          <header className="py-6 pt-10 flex items-center gap-4">
            <button
              onClick={handleBack}
              className="bg-white/5 p-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300"
            >
              <BackIcon />
            </button>
            <h1 className="text-xl font-bold text-white">Player 1</h1>
          </header>

          {/* Step Indicator */}
          <StepIndicator currentStep={2} />

          {/* Content */}
          <main className="flex-1 flex flex-col justify-center py-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full mb-4">
                <LockIcon />
                <span className="font-semibold">Enter Your Secret</span>
              </div>
              <p className="text-slate-400 text-sm">
                Pick {config.digits} unique digits. Don&apos;t let Player 2 see!
              </p>
            </div>

            {/* Secret Display */}
            <SecretDisplay
              secret={currentSecret}
              digits={config.digits}
              showSecret={showSecret}
              onToggle={() => setShowSecret(!showSecret)}
            />

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            )}

            {/* Numpad */}
            <CyberNumpad
              onDigit={handleDigit}
              onClear={handleClear}
              onEnter={handleP1Submit}
              disabledDigits={currentSecret.split('')}
              maxReached={currentSecret.length >= config.digits}
              canSubmit={currentSecret.length === config.digits}
            />
          </main>
        </div>
      </div>
    );
  }

  // Step 3: Handover Screen
  if (setupStep === 3) {
    return (
      <div className="min-h-screen bg-[#111827] flex flex-col font-space">
        <div className="scanlines" />
        
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4">
          {/* Icon */}
          <div className="text-primary mb-8 animate-pulse">
            <HandoverIcon />
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            PASS THE DEVICE
          </h2>
          <p className="text-slate-400 text-center mb-12">
            Hand the phone to <span className="text-primary font-semibold">Player 2</span>
          </p>

          {/* Ready Button */}
          <button
            onClick={handleHandoverReady}
            className="w-full max-w-xs py-4 rounded-xl bg-primary text-black font-bold text-lg shadow-neon hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            I am Player 2 — Ready!
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Player 2 Secret Entry
  if (setupStep === 4) {
    return (
      <div className="min-h-screen bg-[#111827] flex flex-col font-space">
        <div className="scanlines" />
        
        <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-4">
          {/* Header */}
          <header className="py-6 pt-10 flex items-center gap-4">
            <div className="w-9" /> {/* Spacer */}
            <h1 className="text-xl font-bold text-white">Player 2</h1>
          </header>

          {/* Step Indicator */}
          <StepIndicator currentStep={4} />

          {/* Content */}
          <main className="flex-1 flex flex-col justify-center py-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full mb-4">
                <LockIcon />
                <span className="font-semibold">Enter Your Secret</span>
              </div>
              <p className="text-slate-400 text-sm">
                Pick {config.digits} unique digits. Don&apos;t let Player 1 see!
              </p>
            </div>

            {/* Secret Display */}
            <SecretDisplay
              secret={currentSecret}
              digits={config.digits}
              showSecret={showSecret}
              onToggle={() => setShowSecret(!showSecret)}
            />

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            )}

            {/* Numpad with Start Game button */}
            <div className="w-full max-w-xs mx-auto">
              {/* Number Grid */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
                  const isDisabled = currentSecret.includes(digit.toString()) || currentSecret.length >= config.digits;
                  return (
                    <button
                      key={digit}
                      onClick={() => handleDigit(digit.toString())}
                      disabled={isDisabled}
                      className={`
                        aspect-square rounded-xl text-2xl font-bold
                        border transition-all duration-150 active:scale-95
                        ${isDisabled
                          ? 'bg-slate-800/50 text-slate-600 border-slate-700/50 cursor-not-allowed'
                          : 'bg-[#1f2937] text-white border-slate-600 hover:border-primary hover:bg-slate-700'
                        }
                      `}
                    >
                      {digit}
                    </button>
                  );
                })}
              </div>
              
              {/* Bottom Row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setCurrentSecret('')}
                  className="aspect-square rounded-xl text-sm font-semibold
                    bg-red-500/20 text-red-400 border border-red-500/30
                    hover:bg-red-500/30 transition-all active:scale-95"
                >
                  CLR
                </button>
                <button
                  onClick={() => handleDigit('0')}
                  disabled={currentSecret.includes('0') || currentSecret.length >= config.digits}
                  className={`
                    aspect-square rounded-xl text-2xl font-bold border transition-all active:scale-95
                    ${currentSecret.includes('0') || currentSecret.length >= config.digits
                      ? 'bg-slate-800/50 text-slate-600 border-slate-700/50 cursor-not-allowed'
                      : 'bg-[#1f2937] text-white border-slate-600 hover:border-primary'
                    }
                  `}
                >
                  0
                </button>
                <button
                  onClick={handleClear}
                  className="aspect-square rounded-xl bg-slate-700/50 text-slate-300 border border-slate-600
                    hover:bg-slate-600 transition-all active:scale-95 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M2.515 10.674a1.875 1.875 0 000 2.652L8.89 19.7c.352.351.829.549 1.326.549H19.5a3 3 0 003-3V6.75a3 3 0 00-3-3h-9.284c-.497 0-.974.198-1.326.55l-6.375 6.374zM12.53 9.22a.75.75 0 10-1.06 1.06L13.19 12l-1.72 1.72a.75.75 0 101.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L15.31 12l1.72-1.72a.75.75 0 10-1.06-1.06l-1.72 1.72-1.72-1.72z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Start Game Button */}
              <button
                onClick={handleP2Submit}
                disabled={currentSecret.length !== config.digits}
                className={`
                  w-full py-4 rounded-xl text-lg font-bold border transition-all
                  ${currentSecret.length === config.digits
                    ? 'bg-primary text-black border-primary shadow-neon hover:bg-primary/90 active:scale-[0.98]'
                    : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  }
                `}
              >
                🎮 START GAME
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}

export default PassAndPlaySetup;
