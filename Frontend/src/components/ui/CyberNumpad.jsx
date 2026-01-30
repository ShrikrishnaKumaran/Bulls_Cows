/**
 * CyberNumpad - Touch-friendly numeric keypad
 * 
 * A cyber-themed numpad for entering secret codes
 * Large buttons optimized for mobile use
 */

// Backspace Icon
const BackspaceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M2.515 10.674a1.875 1.875 0 000 2.652L8.89 19.7c.352.351.829.549 1.326.549H19.5a3 3 0 003-3V6.75a3 3 0 00-3-3h-9.284c-.497 0-.974.198-1.326.55l-6.375 6.374zM12.53 9.22a.75.75 0 10-1.06 1.06L13.19 12l-1.72 1.72a.75.75 0 101.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L15.31 12l1.72-1.72a.75.75 0 10-1.06-1.06l-1.72 1.72-1.72-1.72z" clipRule="evenodd" />
  </svg>
);

function CyberNumpad({ onDigit, onClear, onEnter, disabledDigits = [], maxReached = false, canSubmit = false }) {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Number Grid 3x3 */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {digits.map((digit) => {
          const isDisabled = disabledDigits.includes(digit.toString()) || maxReached;
          
          return (
            <button
              key={digit}
              onClick={() => onDigit(digit.toString())}
              disabled={isDisabled}
              className={`
                aspect-square rounded-xl text-2xl font-bold
                border transition-all duration-150
                active:scale-95
                ${isDisabled
                  ? 'bg-slate-800/50 text-slate-600 border-slate-700/50 cursor-not-allowed'
                  : 'bg-[#1f2937] text-white border-slate-600 hover:border-primary hover:bg-slate-700 active:bg-slate-600'
                }
              `}
            >
              {digit}
            </button>
          );
        })}
      </div>
      
      {/* Bottom Row: Clear, 0, Backspace */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Clear Button */}
        <button
          onClick={onClear}
          className="aspect-square rounded-xl text-sm font-semibold
            bg-red-500/20 text-red-400 border border-red-500/30
            hover:bg-red-500/30 hover:border-red-500/50
            transition-all duration-150 active:scale-95"
        >
          CLR
        </button>
        
        {/* Zero */}
        <button
          onClick={() => onDigit('0')}
          disabled={disabledDigits.includes('0') || maxReached}
          className={`
            aspect-square rounded-xl text-2xl font-bold
            border transition-all duration-150
            active:scale-95
            ${disabledDigits.includes('0') || maxReached
              ? 'bg-slate-800/50 text-slate-600 border-slate-700/50 cursor-not-allowed'
              : 'bg-[#1f2937] text-white border-slate-600 hover:border-primary hover:bg-slate-700 active:bg-slate-600'
            }
          `}
        >
          0
        </button>
        
        {/* Backspace */}
        <button
          onClick={onClear}
          className="aspect-square rounded-xl
            bg-slate-700/50 text-slate-300 border border-slate-600
            hover:bg-slate-600 hover:text-white
            transition-all duration-150 active:scale-95
            flex items-center justify-center"
        >
          <BackspaceIcon />
        </button>
      </div>
      
      {/* Enter/Submit Button */}
      <button
        onClick={onEnter}
        disabled={!canSubmit}
        className={`
          w-full py-4 rounded-xl text-lg font-bold
          border transition-all duration-200
          ${canSubmit
            ? 'bg-primary text-black border-primary shadow-neon hover:bg-primary/90 active:scale-[0.98]'
            : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
          }
        `}
      >
        LOCK IN SECRET
      </button>
    </div>
  );
}

export default CyberNumpad;
