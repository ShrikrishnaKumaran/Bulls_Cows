/**
 * CyberDrumInput - Infinite Rotating Drum Picker
 * 
 * A premium rotational input with 3D cylinder effect.
 * Numbers wrap infinitely (9→0, 0→9) like a real tumbler lock.
 */
import { useState, useEffect, useCallback } from 'react';

// Individual Rotational Digit Column
const DrumColumn = ({ value, onChange, disabled }) => {
  // Generate visible numbers (show 5 numbers: 2 above, current, 2 below)
  const getVisibleNumbers = (centerValue) => {
    const numbers = [];
    for (let i = -2; i <= 2; i++) {
      let num = (centerValue + i + 10) % 10; // Wrap around
      numbers.push({ num, offset: i });
    }
    return numbers;
  };

  const visibleNumbers = getVisibleNumbers(value);

  // Handle increment/decrement with wrap
  const increment = () => {
    if (disabled) return;
    onChange((value + 1) % 10);
  };

  const decrement = () => {
    if (disabled) return;
    onChange((value - 1 + 10) % 10);
  };

  // Handle click on a number
  const handleNumberClick = (num) => {
    if (disabled) return;
    onChange(num);
  };

  // Handle scroll wheel
  const handleWheel = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    if (e.deltaY > 0) {
      onChange((value + 1) % 10);
    } else {
      onChange((value - 1 + 10) % 10);
    }
  }, [disabled, value, onChange]);

  return (
    <div 
      className={`relative h-32 w-14 sm:w-16 select-none ${disabled ? 'opacity-50' : ''}`}
      onWheel={handleWheel}
    >
      {/* Up Arrow */}
      <button
        onClick={decrement}
        disabled={disabled}
        className="absolute top-0 left-0 right-0 h-6 flex items-center justify-center 
                   text-slate-600 hover:text-primary transition-colors z-20"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Numbers Container */}
      <div className="absolute inset-x-0 top-6 bottom-6 overflow-hidden">
        {/* 3D Gradient Mask - Top */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/80 to-transparent pointer-events-none z-10" />
        
        {/* 3D Gradient Mask - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/80 to-transparent pointer-events-none z-10" />

        {/* Numbers */}
        <div className="h-full flex flex-col items-center justify-center">
          {visibleNumbers.map(({ num, offset }) => {
            const isCenter = offset === 0;
            const opacity = isCenter ? 1 : Math.max(0.15, 0.5 - Math.abs(offset) * 0.2);
            const scale = isCenter ? 1.3 : Math.max(0.6, 1 - Math.abs(offset) * 0.2);
            
            return (
              <div
                key={`${num}-${offset}`}
                onClick={() => handleNumberClick(num)}
                className={`
                  flex items-center justify-center cursor-pointer
                  font-mono font-bold transition-all duration-200
                  ${isCenter 
                    ? 'text-4xl sm:text-5xl text-primary drop-shadow-[0_0_12px_rgba(250,204,20,0.8)]' 
                    : 'text-lg sm:text-xl text-slate-500'
                  }
                `}
                style={{
                  opacity,
                  transform: `scale(${scale})`,
                  height: isCenter ? '2.5rem' : '1.25rem',
                }}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>

      {/* Down Arrow */}
      <button
        onClick={increment}
        disabled={disabled}
        className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-center 
                   text-slate-600 hover:text-primary transition-colors z-20"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

function CyberDrumInput({ length = 4, value = '', onChange, disabled = false }) {
  // Initialize digits array from value or zeros
  const [digits, setDigits] = useState(() => {
    const initial = [];
    for (let i = 0; i < length; i++) {
      initial.push(value[i] ? parseInt(value[i]) : 0);
    }
    return initial;
  });
  
  // Update parent when digits change
  useEffect(() => {
    const newValue = digits.join('');
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [digits, onChange, value]);
  
  // Handle individual digit change
  const handleDigitChange = (index, newDigit) => {
    setDigits(prev => {
      const updated = [...prev];
      updated[index] = newDigit;
      return updated;
    });
  };
  
  // Reset when length changes
  useEffect(() => {
    setDigits(Array(length).fill(0));
  }, [length]);
  
  return (
    <div className="relative">
      {/* Container with 3D depth */}
      <div className="bg-[#0d1117] border border-slate-700 rounded-2xl py-3 px-4 sm:px-6 flex justify-center gap-3 sm:gap-4
                      shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]">
        {/* Digit Columns */}
        {digits.map((digit, index) => (
          <DrumColumn
            key={index}
            value={digit}
            onChange={(newDigit) => handleDigitChange(index, newDigit)}
            disabled={disabled}
          />
        ))}
      </div>
      
      {/* Center Highlight Lens - Enhanced */}
      <div 
        className="absolute left-4 right-4 sm:left-6 sm:right-6 top-1/2 -translate-y-1/2 h-12 sm:h-14 
                   border-y-2 border-primary/50 bg-primary/5 rounded-xl
                   shadow-[0_0_20px_rgba(250,204,20,0.15)]
                   pointer-events-none"
      />
    </div>
  );
}

export default CyberDrumInput;
