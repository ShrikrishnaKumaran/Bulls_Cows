/**
 * SetupStepper - Progress Line Stepper Component
 * 
 * Circuit trace style stepper showing progress through the 4 setup steps:
 * 1. CONFIG - Game configuration
 * 2. P1 SETUP - Player 1 secret entry
 * 3. HANDOVER - Device handover screen
 * 4. P2 SETUP - Player 2 secret entry
 */

const SetupStepper = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'CONFIG' },
    { num: 2, label: 'P1 SETUP' },
    { num: 3, label: 'HANDOVER' },
    { num: 4, label: 'P2 SETUP' },
  ];

  return (
    <div className="flex items-center justify-center mb-8 px-2">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          {/* Step Node */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                border-2 transition-all duration-300
                ${step.num === currentStep
                  ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(250,204,20,0.5)] ring-4 ring-primary/20'
                  : step.num < currentStep
                    ? 'bg-primary/40 text-primary border-primary/60'
                    : 'bg-slate-800 text-slate-500 border-slate-600'
                }
              `}
            >
              {step.num < currentStep ? '✓' : step.num}
            </div>
            <span
              className={`
                text-[9px] mt-1.5 font-bold tracking-wider uppercase
                ${step.num === currentStep
                  ? 'text-primary'
                  : step.num < currentStep
                    ? 'text-primary/70'
                    : 'text-slate-500'
                }
              `}
            >
              {step.label}
            </span>
          </div>
          
          {/* Connector Line - Glowing when completed */}
          {i < steps.length - 1 && (
            <div className="relative mx-1.5">
              {/* Background line */}
              <div className="w-8 sm:w-12 h-0.5 bg-slate-700" />
              {/* Glowing overlay for completed */}
              {step.num < currentStep && (
                <div 
                  className="absolute inset-0 bg-primary/60 shadow-[0_0_8px_rgba(250,204,20,0.5)]" 
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SetupStepper;
