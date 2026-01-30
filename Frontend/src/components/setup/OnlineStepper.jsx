/**
 * OnlineStepper - Progress Indicator for Online Mode Setup
 * 
 * Simpler 2-step indicator for online gameplay:
 * 1. SET SECRET - Player sets their secret code
 * 2. SYNC - Waiting for opponent / Ready to play
 */

const OnlineStepper = ({ hasSubmitted, opponentReady, roundNumber = 1 }) => {
  // Step states: 'active', 'complete', 'waiting', 'pending'
  const step1State = hasSubmitted ? 'complete' : 'active';
  const step2State = hasSubmitted 
    ? (opponentReady ? 'complete' : 'waiting') 
    : 'pending';

  const getStepStyles = (state) => {
    switch (state) {
      case 'complete':
        return {
          circle: 'bg-primary/40 text-primary border-primary/60',
          text: 'text-primary/70',
          icon: '✓'
        };
      case 'active':
        return {
          circle: 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(250,204,20,0.5)] ring-4 ring-primary/20',
          text: 'text-primary',
          icon: '1'
        };
      case 'waiting':
        return {
          circle: 'bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] ring-4 ring-blue-500/20 animate-pulse',
          text: 'text-blue-400',
          icon: '⏳'
        };
      default: // pending
        return {
          circle: 'bg-slate-800 text-slate-500 border-slate-600',
          text: 'text-slate-500',
          icon: '2'
        };
    }
  };

  const step1 = getStepStyles(step1State);
  const step2 = getStepStyles(step2State);

  return (
    <div className="flex items-center justify-center mb-6 px-4">
      {/* Round indicator */}
      <div className="absolute left-4 top-4">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Round {roundNumber}
        </span>
      </div>

      {/* Step 1: Set Secret */}
      <div className="flex flex-col items-center">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
            border-2 transition-all duration-300
            ${step1.circle}
          `}
        >
          {step1.icon}
        </div>
        <span
          className={`
            text-[10px] mt-2 font-bold tracking-wider uppercase whitespace-nowrap
            ${step1.text}
          `}
        >
          SET SECRET
        </span>
      </div>
      
      {/* Connector Line */}
      <div className="relative mx-4 w-16 sm:w-24">
        {/* Background line */}
        <div className="w-full h-0.5 bg-slate-700" />
        {/* Glowing overlay when step 1 complete */}
        {hasSubmitted && (
          <div 
            className="absolute inset-0 bg-primary/60 shadow-[0_0_8px_rgba(250,204,20,0.5)]" 
          />
        )}
      </div>

      {/* Step 2: Sync / Ready */}
      <div className="flex flex-col items-center">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
            border-2 transition-all duration-300
            ${step2.circle}
          `}
        >
          {step2.icon}
        </div>
        <span
          className={`
            text-[10px] mt-2 font-bold tracking-wider uppercase whitespace-nowrap
            ${step2.text}
          `}
        >
          {opponentReady && hasSubmitted ? 'SYNCED' : hasSubmitted ? 'SYNCING...' : 'SYNC'}
        </span>
      </div>
    </div>
  );
};

export default OnlineStepper;
