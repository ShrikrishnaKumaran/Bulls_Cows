/**
 * GameRulesModal - How to Play Modal
 * 
 * Detailed game rules explanation with:
 * - 4 step guide with icons
 * - Visual feedback explanation (Bulls, Cows, Miss)
 * - Terminal-style live example
 */

// ═══════════════════════════════════════════════════════════
// SVG ICONS
// ═══════════════════════════════════════════════════════════

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

const ArrowsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M15.97 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H7.5a.75.75 0 010-1.5h11.69l-3.22-3.22a.75.75 0 010-1.06zm-7.94 9a.75.75 0 010 1.06l-3.22 3.22H16.5a.75.75 0 010 1.5H4.81l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 0z" clipRule="evenodd" />
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 6a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0112 6z" clipRule="evenodd" />
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15.19a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// STEP COMPONENT
// ═══════════════════════════════════════════════════════════

const Step = ({ icon, iconColor, title, children }) => (
  <div className="flex gap-2.5 mb-3.5">
    <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center ${iconColor}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-black text-white text-[13px] mb-0.5 uppercase tracking-wide">{title}</h3>
      <div className="text-slate-400 text-[11px] leading-[1.6]">
        {children}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

function GameRulesModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-0 sm:items-center bg-black/70 backdrop-blur-sm">
      {/* Modal Card */}
      <div className="relative bg-[#0d1520] border border-slate-700/60 rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden font-space">
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <div>
            <h2 className="text-[15px] font-black text-white uppercase tracking-[0.15em]">
              How to Play
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:text-white hover:bg-slate-600/60 hover:border-slate-500/60 transition-all"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3.5 max-h-[72vh] overflow-y-auto" style={{scrollbarWidth:'none'}}>
          
          {/* Step 1 */}
          <Step
            icon={<LockIcon />}
            iconColor="text-yellow-400"
            title="Set Your Secret"
          >
            Pick 3 or 4 unique digits.
            No repeats allowed — <span className="text-slate-300">1234</span> is valid,{' '}
            <span className="text-red-400/70 line-through">1123</span> is not.
          </Step>

          {/* Step 2 */}
          <Step
            icon={<ArrowsIcon />}
            iconColor="text-cyan-400"
            title="Take Turns"
          >
            Players alternate guessing each other&apos;s secret code.
            Crack it before your opponent does.
          </Step>

          {/* Step 3 */}
          <Step
            icon={<TargetIcon />}
            iconColor="text-emerald-400"
            title="Read Feedback"
          >
            After each guess, you get clues:
            <div className="space-y-1 mt-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">🐂</span>
                <span className="text-yellow-400 font-bold text-[11px] font-mono">BULL</span>
                <span className="text-slate-500 text-[11px]">— Correct digit & position</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🐮</span>
                <span className="text-cyan-400 font-bold text-[11px] font-mono">COW</span>
                <span className="text-slate-500 text-[11px]">— Correct digit, wrong spot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">❌</span>
                <span className="text-red-400 font-bold text-[11px] font-mono">MISS</span>
                <span className="text-slate-500 text-[11px]">— Digit not in the secret</span>
              </div>
            </div>
          </Step>

          {/* Step 4 */}
          <Step
            icon={<TrophyIcon />}
            iconColor="text-amber-400"
            title="Win the Game"
          >
            Score <span className="text-yellow-400 font-bold">all Bulls</span> to win.
            First player to fully crack the code takes the round.
          </Step>

          {/* Terminal Example */}
          <div className="bg-black/50 border-l-2 border-primary/50 rounded-r-lg px-3 py-2.5 font-mono text-[11px]">
            <div className="text-slate-600 mb-1">{'// Example — 4-digit mode'}</div>
            <div className="space-y-0.5">
              <div className="flex gap-2">
                <span className="text-slate-500 w-12">Secret:</span>
                <span className="tracking-widest">
                  <span className="text-white">7</span>{" "}
                  <span className="text-cyan-400">4</span>{" "}
                  <span className="text-cyan-400">1</span>{" "}
                  <span className="text-white">9</span>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500 w-12">Guess:</span>
                <span className="tracking-widest">
                  <span className="text-cyan-400">&nbsp;1</span>{" "}
                  <span className="text-yellow-400">4</span>{" "}
                  <span className="text-cyan-400">7</span>{" "}
                  <span className="text-red-400">8</span>
                </span>
              </div>
              <div className="border-t border-slate-700/50 my-1"></div>
              <div className="flex gap-2">
                <span className="text-slate-500 w-12">Result:</span>
                <span>
                  <span className="text-yellow-400">1 Bull</span>
                  <span className="text-slate-600"> · </span>
                  <span className="text-cyan-400">2 Cows</span>
                  <span className="text-slate-600"> · </span>
                  <span className="text-red-400">1 Miss</span>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-yellow-400 text-black font-black text-sm uppercase tracking-wider font-mono transition-all active:scale-[0.98]"
          >
            Got it!
          </button>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600/40 to-transparent" />
      </div>
    </div>
  );
}

export default GameRulesModal;
