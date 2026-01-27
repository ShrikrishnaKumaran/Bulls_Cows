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
  <div className="flex gap-3 mb-4">
    <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center ${iconColor}`}>
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-white text-sm mb-0.5">{title}</h3>
      <div className="text-slate-300 text-xs leading-relaxed">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Modal Card */}
      <div className="bg-[#1f2937] border border-slate-700 rounded-2xl w-full max-w-md m-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white tracking-wide">
            HOW TO PLAY
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body - Full View (No Scroll) */}
        <div className="p-5">
          
          {/* Step 1: Choose Your Secret */}
          <Step
            icon={<LockIcon />}
            iconColor="text-yellow-400"
            title="Choose Your Secret"
          >
            Pick 3 or 4 unique digits (e.g., 123 or 1234). Each digit can only appear once — no repeats like 1123.
          </Step>

          {/* Step 2: Take Turns */}
          <Step
            icon={<ArrowsIcon />}
            iconColor="text-blue-400"
            title="Take Turns"
          >
            Each player takes turns guessing the other player&apos;s secret.
          </Step>

          {/* Step 3: Understand Feedback */}
          <Step
            icon={<TargetIcon />}
            iconColor="text-green-400"
            title="Understand Feedback"
          >
            <div className="space-y-1.5 mt-1">
              <div className="flex items-center gap-2">
                <span>🦬</span>
                <span className="text-yellow-400 font-semibold text-xs">BULL</span>
                <span className="text-slate-400 text-xs">— Right digit, Right spot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">🐄</span>
                <span className="text-blue-400 font-semibold text-xs">COW</span>
                <span className="text-slate-400 text-xs">— Right digit, Wrong spot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">❌</span>
                <span className="text-slate-500 font-semibold text-xs">MISS</span>
                <span className="text-slate-400 text-xs">— Digit not in secret</span>
              </div>
            </div>
          </Step>

          {/* Step 4: Win the Game */}
          <Step
            icon={<TrophyIcon />}
            iconColor="text-amber-400"
            title="Win the Game"
          >
            First to get <span className="text-yellow-400 font-semibold">all Bulls</span> (3 or 4 depending on mode) wins!
          </Step>

          {/* Terminal Style Example */}
          <div className="bg-[#111827] rounded-lg p-3 mt-1 font-mono text-xs border border-slate-700">
            {/* Example (4-digit mode) */}
            <div className="text-slate-500 mb-1">{'// Example (4-digit mode)'}</div>
            <div className="space-y-0.5">
              <div className="flex gap-2">
                <span className="text-slate-400">Secret:</span>
                <span className="tracking-widest">
                  <span className="text-yellow-400">1</span>{" "}
                  <span className="text-blue-400">2</span>{" "}
                  <span className="text-blue-400">3</span>{" "}
                  <span className="text-white">4</span>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-400">Guess:</span>
                <span className="tracking-widest">
                  <span className="text-yellow-400">&nbsp;1</span>{" "}
                  <span className="text-blue-400">3</span>{" "}
                  <span className="text-blue-400">2</span>{" "}
                  <span className="text-red-500">5</span>
                </span>
              </div>
              <div className="border-t border-slate-700 my-1.5"></div>
              <div className="flex gap-2">
                <span className="text-slate-400">Result:</span>
                <span>
                  <span className="text-yellow-400">1 Bull</span>
                  <span className="text-slate-500">, </span>
                  <span className="text-blue-400">2 Cows</span>
                  <span className="text-slate-500">, </span>
                  <span className="text-red-500">1 Miss</span>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black font-semibold transition-colors"
          >
            Got it!
          </button>
        </div>

      </div>
    </div>
  );
}

export default GameRulesModal;
