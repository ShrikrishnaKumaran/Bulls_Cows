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
        ${isActive ? 'scale-110' : 'scale-100'}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
      style={{ width: '18vw', maxWidth: '4.5rem', minWidth: '3.5rem' }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onTouchStart={() => setIsActive(true)}
      onTouchEnd={() => setTimeout(() => setIsActive(false), 100)}
    >
      {/* Outer Glow Ring */}
      <div
        className={`
          absolute inset-[-4px] rounded-full pointer-events-none transition-all duration-300
          ${isActive
            ? 'bg-gradient-to-b from-primary/40 via-primary/20 to-transparent blur-md opacity-100'
            : 'opacity-0'
          }
        `}
      />

      {/* The Orb Container - Square aspect ratio with 3D depth */}
      <div
        ref={sphereRef}
        className={`
          w-full aspect-square rounded-full relative
          bg-gradient-to-b from-slate-600 via-slate-800 to-slate-950
          border-2 transition-all duration-300 overflow-hidden
          ${isActive
            ? 'border-primary shadow-[0_0_40px_rgba(250,204,20,0.7),_0_8px_32px_rgba(0,0,0,0.8),_inset_0_-12px_30px_rgba(0,0,0,0.9),_inset_0_6px_15px_rgba(255,255,255,0.15)]'
            : 'border-slate-500/50 shadow-[0_8px_28px_rgba(0,0,0,0.6),_inset_0_-10px_25px_rgba(0,0,0,0.8),_inset_0_4px_12px_rgba(255,255,255,0.1)]'
          }
        `}
        style={{
          transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
        }}
      >
        {/* 3D Outer Ring Effect */}
        <div className="absolute inset-[-3px] rounded-full border border-slate-400/25 pointer-events-none" />

        {/* Glass Highlight - Top Arc (3D Reflection) */}
        <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[65%] h-[18%] bg-gradient-to-b from-white/25 via-white/10 to-transparent rounded-full blur-[1px] pointer-events-none" />

        {/* Secondary Highlight - Smaller Arc */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[45%] h-[10%] bg-gradient-to-b from-white/35 to-transparent rounded-full pointer-events-none" />

        {/* Center Selection Indicator - Just thin border lines, no fill */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[35%] pointer-events-none z-10">
          <div className={`h-full border-y transition-all duration-300 ${isActive ? 'border-primary/60' : 'border-primary/30'}`} />
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
                    font-mono font-bold transition-all duration-200
                    ${isSelected
                      ? 'text-primary text-[clamp(1.5rem,5vw,2rem)] drop-shadow-[0_0_15px_rgba(250,204,20,0.95)]'
                      : 'text-slate-400 text-[clamp(0.85rem,3vw,1.1rem)]'
                    }
                  `}
                >
                  {num}
                </span>
              </div>
            );
          })}

          {/* Bottom Spacer - Centers last item */}
          <div style={{ height: '32.5%' }} />
        </div>

        {/* Top Fade - Lighter for visibility */}
        <div className="absolute top-0 inset-x-0 h-[20%] bg-gradient-to-b from-slate-700/80 via-slate-800/40 to-transparent pointer-events-none rounded-t-full" />

        {/* Bottom Fade - Lighter for visibility */}
        <div className="absolute bottom-0 inset-x-0 h-[20%] bg-gradient-to-t from-slate-900/80 via-slate-800/40 to-transparent pointer-events-none rounded-b-full" />

        {/* Inner Glass Rim Effect - 3D Edge */}
        <div className="absolute inset-0 rounded-full pointer-events-none border border-white/[0.1] shadow-[inset_0_1px_3px_rgba(255,255,255,0.12)]" />

        {/* Bottom Reflection Curve */}
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-[55%] h-[8%] bg-gradient-to-t from-white/8 to-transparent rounded-full blur-[2px] pointer-events-none" />
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
    <div className="flex justify-center items-center w-full py-2" style={{ gap: '4%' }}>
      {/* Holo-Spheres with enhanced spacing */}
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