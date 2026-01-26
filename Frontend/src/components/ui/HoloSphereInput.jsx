/**
 * HoloSphereInput - 3D Holo-Sphere Digit Input
 * 
 * Each digit is enclosed in a glowing glass orb with 3D depth effects.
 * Users swipe/scroll inside the sphere to spin the numbers with infinite loop.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

// Looped array for infinite scroll: [7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2]
const BASE_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const LOOPED_NUMBERS = [...BASE_NUMBERS.slice(7), ...BASE_NUMBERS, ...BASE_NUMBERS, ...BASE_NUMBERS.slice(0, 3)];
const LOOP_OFFSET = 3;
const TOTAL_ITEMS = 10;

// Individual 3D Holo-Sphere Column with Infinite Scroll
const HoloSphere = ({ value, onChange, disabled }) => {
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const isAdjustingRef = useRef(false);
  
  const [isActive, setIsActive] = useState(false);
  const [itemHeight, setItemHeight] = useState(0);
  const sphereRef = useRef(null);
  
  // Calculate item height based on sphere size
  useEffect(() => {
    if (sphereRef.current) {
      const sphereHeight = sphereRef.current.offsetHeight;
      setItemHeight(sphereHeight * 0.35);
    }
  }, []);
  
  // Scroll to current value on mount
  useEffect(() => {
    if (containerRef.current && !isScrollingRef.current && itemHeight > 0) {
      // Position in the middle set (index = LOOP_OFFSET + value)
      const targetIndex = LOOP_OFFSET + value;
      const targetScroll = targetIndex * itemHeight;
      containerRef.current.scrollTo({
        top: targetScroll,
        behavior: 'instant'
      });
    }
  }, [value, itemHeight]);
  
  // Handle infinite scroll wrapping
  const handleScroll = useCallback(() => {
    if (isScrollingRef.current || itemHeight === 0 || isAdjustingRef.current) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    isScrollingRef.current = true;
    
    setTimeout(() => {
      const scrollTop = container.scrollTop;
      let selectedIndex = Math.round(scrollTop / itemHeight);
      
      // Get actual digit value from looped array
      const actualDigit = LOOPED_NUMBERS[selectedIndex];
      
      // If scrolled too far up or down, reset to middle section
      if (selectedIndex < LOOP_OFFSET || selectedIndex >= LOOP_OFFSET + TOTAL_ITEMS) {
        isAdjustingRef.current = true;
        const newIndex = LOOP_OFFSET + actualDigit;
        container.scrollTo({
          top: newIndex * itemHeight,
          behavior: 'instant'
        });
        setTimeout(() => {
          isAdjustingRef.current = false;
        }, 50);
      } else {
        // Snap to position
        container.scrollTo({
          top: selectedIndex * itemHeight,
          behavior: 'smooth'
        });
      }
      
      if (actualDigit !== value) {
        onChange(actualDigit);
      }
      
      isScrollingRef.current = false;
    }, 300);
  }, [value, onChange, itemHeight]);
  
  // Scroll to specific number when clicked
  const scrollToNumber = (num) => {
    if (disabled || itemHeight === 0) return;
    const targetIndex = LOOP_OFFSET + num;
    containerRef.current?.scrollTo({
      top: targetIndex * itemHeight,
      behavior: 'smooth'
    });
    onChange(num);
  };
  
  return (
    <div 
      className={`
        relative transition-all duration-200 transform flex-shrink-0
        ${isActive ? 'scale-105' : 'scale-100'}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
      style={{ width: '15vw', maxWidth: '4rem', minWidth: '3rem' }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onTouchStart={() => setIsActive(true)}
      onTouchEnd={() => setTimeout(() => setIsActive(false), 100)}
    >
      {/* The Orb Container - Square aspect ratio */}
      <div 
        ref={sphereRef}
        className={`
          w-full aspect-square rounded-full 
          bg-gradient-to-b from-slate-800 to-slate-900
          border-2 transition-all duration-200 overflow-hidden relative
          shadow-[inset_0_-8px_20px_rgba(0,0,0,0.9),_inset_0_4px_8px_rgba(255,255,255,0.05)]
          ${isActive 
            ? 'border-primary/70 shadow-[0_0_20px_rgba(250,204,20,0.5),_inset_0_-8px_20px_rgba(0,0,0,0.9)]' 
            : 'border-slate-600/30'
          }
        `}
      >
        {/* Glass Highlight - Top */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-1/2 h-[10%] bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-full pointer-events-none" />
        
        {/* Center Selection Indicator */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[35%] pointer-events-none z-10">
          <div className="h-full bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 border-y border-primary/20" />
        </div>
        
        {/* Scrollable Numbers Container */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-scroll scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* Top Spacer - Centers first item */}
          <div style={{ height: '32.5%' }} />
          
          {/* Numbers (Looped for infinite scroll) */}
          {LOOPED_NUMBERS.map((num, idx) => {
            const isSelected = idx === LOOP_OFFSET + value;
            return (
              <div
                key={idx}
                onClick={() => scrollToNumber(num)}
                className="flex items-center justify-center cursor-pointer select-none"
                style={{ height: '35%' }}
              >
                <span 
                  className={`
                    font-mono font-bold transition-all duration-150
                    ${isSelected 
                      ? 'text-primary text-[clamp(1.25rem,4vw,1.75rem)]' 
                      : 'text-slate-500 text-[clamp(0.75rem,2.5vw,1rem)]'
                    }
                  `}
                  style={{
                    textShadow: isSelected ? '0 0 12px rgba(250, 204, 20, 0.8)' : 'none'
                  }}
                >
                  {num}
                </span>
              </div>
            );
          })}
          
          {/* Bottom Spacer - Centers last item */}
          <div style={{ height: '32.5%' }} />
        </div>
        
        {/* Top Fade */}
        <div className="absolute top-0 inset-x-0 h-[20%] bg-gradient-to-b from-slate-900 to-transparent pointer-events-none" />
        
        {/* Bottom Fade */}
        <div className="absolute bottom-0 inset-x-0 h-[20%] bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
        
        {/* Glass Rim Effect */}
        <div className="absolute inset-0 rounded-full pointer-events-none border border-white/5" />
      </div>
    </div>
  );
};

function HoloSphereInput({ length = 4, value = '', onChange, disabled = false }) {
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
    <div className="flex justify-center items-center w-full" style={{ gap: '3%' }}>
      {/* Holo-Spheres */}
      {digits.map((digit, index) => (
        <HoloSphere
          key={index}
          value={digit}
          onChange={(newDigit) => handleDigitChange(index, newDigit)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export default HoloSphereInput;