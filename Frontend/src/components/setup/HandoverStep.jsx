/**
 * HandoverStep - Device Handover Screen
 * 
 * Step 3: Prompts players to pass the device between them.
 * Shows a clear "Pass to Player 2" message with Ready button.
 */
import { HandoverIcon } from './SetupIcons';

const HandoverStep = ({ onReady }) => {
  return (
    <div className="min-h-screen bg-[#111827] flex flex-col font-space overflow-hidden">
      <div className="scanlines" />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-3 sm:px-4">
        <div className="text-primary mb-8 animate-pulse">
          <HandoverIcon />
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-4">
          PASS THE DEVICE
        </h2>
        <p className="text-slate-400 text-center mb-12">
          Hand the Device to <span className="text-primary font-semibold">Player 2</span>
        </p>

        <button
          onClick={onReady}
          className="w-full max-w-xs py-4 rounded-xl bg-primary text-black font-bold text-lg shadow-neon hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          I am Player 2 — Ready!
        </button>
      </div>
    </div>
  );
};

export default HandoverStep;
