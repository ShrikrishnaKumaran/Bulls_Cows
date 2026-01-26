/**
 * CyberDrumInput - Scrollable Rotating Drum Picker (iOS Style)
 * 
 * A premium scrollable input that looks like an iOS time picker
 * with 3D cylinder effect and smooth snap scrolling.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

// Individual Scrollable Digit Column
const DrumColumn = ({ value, onChange, disabled }) => {
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const ITEM_HEIGHT = 32; // Reduced from 48px to 32px
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // Scroll to current value on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = value * ITEM_HEIGHT;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle scroll end to detect selected number - with reduced sensitivity
  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Debounce scroll detection - increased timeout for slower response
    isScrollingRef.current = true;
    
    setTimeout(() => {
      const scrollTop = container.scrollTop;
      const selectedIndex = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(9, selectedIndex));
      
      if (clampedIndex !== value) {
        onChange(clampedIndex);
      }
      
      isScrollingRef.current = false;
    }, 200); // Increased from 100ms to 200ms
  }, [value, onChange]);
  
  // Scroll to specific number when clicked
  const scrollToNumber = (num) => {
    if (disabled) return;
    containerRef.current?.scrollTo({
      top: num * ITEM_HEIGHT,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="relative h-20 sm:h-24 w-10 sm:w-12">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`
          h-full overflow-y-scroll snap-y snap-mandatory
          scrollbar-hide
          ${disabled ? 'pointer-events-none opacity-50' : ''}
        `}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          // Reduce scroll sensitivity
          scrollBehavior: 'smooth',
        }}
      >
        {/* Top Spacer (so first item can center) */}
        <div className="h-6 sm:h-8" />
        
        {/* Numbers */}
        {numbers.map((num) => {
          const isSelected = num === value;
          return (
            <div
              key={num}
              onClick={() => scrollToNumber(num)}
              className={`
                h-8 flex items-center justify-center snap-center
                font-mono text-lg sm:text-xl font-bold cursor-pointer
                transition-all duration-150
                ${isSelected 
                  ? 'text-primary scale-110' 
                  : 'text-slate-600 opacity-50 hover:opacity-70'
                }
              `}
            >
              {num}
            </div>
          );
        })}
        
        {/* Bottom Spacer (so last item can center) */}
        <div className="h-6 sm:h-8" />
      </div>
      
      {/* Top Gradient Fade */}
      <div className="absolute top-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-b from-[#0d1117] to-transparent pointer-events-none z-10" />
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none z-10" />
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
      {/* Container */}
      <div className="bg-[#0d1117] border border-slate-700 rounded-xl py-2 px-2 sm:px-3 flex justify-center gap-2 sm:gap-3">
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
      
      {/* Center Highlight Lens */}
      <div 
        className="absolute left-2 right-2 sm:left-3 sm:right-3 top-1/2 -translate-y-1/2 h-6 sm:h-8 
                   border-y border-primary/30 bg-primary/5 rounded-lg 
                   pointer-events-none"
      />
    </div>
  );
}

export default CyberDrumInput;
