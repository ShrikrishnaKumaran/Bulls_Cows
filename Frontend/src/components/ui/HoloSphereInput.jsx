/**
 * HoloSphereInput - 3D Holo-Sphere Digit Input
 * 
 * Each digit is enclosed in a glowing glass orb with 3D depth effects.
 * Users swipe/scroll inside the sphere to spin the numbers with infinite loop.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * CONFIGURATION
 * We generate 3 sets of numbers.
 * The user operates in the "Middle" set.
 * If they scroll to the Top set, we teleport them to Middle.
 * If they scroll to the Bottom set, we teleport them to Middle.
 */
const BASE_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
// [Set 1 (Buffer)] -- [Set 2 (Active)] -- [Set 3 (Buffer)]
const LOOP_SETS = 3; 
const ITEMS_PER_SET = 10;
const ALL_NUMBERS = [...BASE_NUMBERS, ...BASE_NUMBERS, ...BASE_NUMBERS];
const MIDDLE_SET_OFFSET = ITEMS_PER_SET; // The index where the middle set starts (10)

const HoloSphere = ({ value, onChange, disabled, size = 'md' }) => {
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const isTeleporting = useRef(false);
  const [activeDigit, setActiveDigit] = useState(value);
  const [isInteracting, setIsInteracting] = useState(false);

  // --- 1. INITIAL SETUP: Scroll to initial value ---
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const height = container.clientHeight;
      // Calculate position in the Middle Set
      const targetIndex = MIDDLE_SET_OFFSET + parseInt(value, 10);
      
      // Instant jump on mount
      container.scrollTo({
        top: targetIndex * height,
        behavior: 'instant'
      });
      setActiveDigit(parseInt(value, 10));
    }
  }, []); // Run once on mount

  // --- 2. INTERSECTION OBSERVER: Detects Glow & Value ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Disconnect previous observer
    if (observerRef.current) observerRef.current.disconnect();

    const callback = (entries) => {
      entries.forEach((entry) => {
        // If an item is mostly visible (threshold 0.7)
        if (entry.isIntersecting && !isTeleporting.current) {
          const rawIndex = parseInt(entry.target.getAttribute('data-index'), 10);
          const actualDigit = parseInt(entry.target.getAttribute('data-value'), 10);

          setActiveDigit(actualDigit);
          
          // Only trigger change if it's different to prevent loops
          if (actualDigit !== value) {
            onChange(actualDigit);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(callback, {
      root: container,
      threshold: 0.65, // Item must be 65% visible to count as "Active"
    });

    // Observe all children
    const items = container.querySelectorAll('.sphere-item');
    items.forEach((item) => observerRef.current.observe(item));

    return () => observerRef.current?.disconnect();
  }, [onChange, value]); // Re-bind if external handlers change

  // --- 3. INFINITE SCROLL LOGIC (The Teleport) ---
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isTeleporting.current) return;

    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    const totalHeight = container.scrollHeight;

    // Thresholds to jump back to middle
    // If we are in the Top Set (Set 1)
    if (scrollTop < height * ITEMS_PER_SET * 0.5) {
      isTeleporting.current = true;
      const offset = scrollTop;
      // Jump forward by one set length
      const jumpAmount = height * ITEMS_PER_SET;
      container.scrollTop = offset + jumpAmount;
      
      // Small timeout to let the browser paint the jump before re-enabling observer logic
      requestAnimationFrame(() => { isTeleporting.current = false; });
    }
    // If we are in the Bottom Set (Set 3)
    else if (scrollTop > totalHeight - (height * ITEMS_PER_SET * 0.5)) {
      isTeleporting.current = true;
      const offset = scrollTop;
      // Jump backward by one set length
      const jumpAmount = height * ITEMS_PER_SET;
      container.scrollTop = offset - jumpAmount;
      
      requestAnimationFrame(() => { isTeleporting.current = false; });
    }
  }, []);

  // --- 4. CLICK TO SELECT ---
  const scrollToNumber = (num, idx) => {
    if (disabled || !containerRef.current) return;
    const height = containerRef.current.clientHeight;
    
    // We always scroll to the specific index clicked to avoid confusion
    containerRef.current.scrollTo({
      top: idx * height,
      behavior: 'smooth'
    });
  };

  // --- 5. STYLES ---
  const sizeStyles = size === 'sm' 
    ? { width: '3.5rem', height: '3.5rem', fontSize: '1.5rem' }
    : { width: '4.5rem', height: '4.5rem', fontSize: '2rem' };
    
  const neighborSize = size === 'sm' ? '1.1rem' : '1.25rem';

  return (
    <div
      className={`relative flex-shrink-0 transition-transform duration-300 ${isInteracting ? 'scale-110 z-10' : 'scale-100 z-0'}`}
      style={{ width: sizeStyles.width, height: sizeStyles.height }}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => setTimeout(() => setIsInteracting(false), 200)}
    >
      {/* GLOW EFFECT (Only visible when interacting) */}
      <div 
        className={`absolute inset-[-10px] rounded-full bg-primary/30 blur-xl transition-opacity duration-300 ${isInteracting ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* SPHERE CONTAINER */}
      <div 
        className={`
          w-full h-full rounded-full relative overflow-hidden
          bg-gradient-to-b from-slate-700 via-slate-900 to-black
          border-2 box-border transition-colors duration-300
          ${isInteracting ? 'border-primary/60 shadow-[0_0_15px_rgba(250,204,20,0.5)]' : 'border-slate-600 shadow-inner'}
        `}
      >
        {/* GLASS HIGHLIGHTS (Static) */}
        <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent rounded-t-full pointer-events-none z-20" />
        <div className="absolute top-[10%] left-[15%] w-[70%] h-[20%] bg-white/5 blur-[2px] rounded-full pointer-events-none z-20" />
        
        {/* SCROLL VIEWPORT */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-scroll overflow-x-hidden scrollbar-hide snap-y snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollBehavior: 'auto' // handled manually or by CSS snap
          }}
        >
          {ALL_NUMBERS.map((num, idx) => {
            const isActive = activeDigit === num;
            
            // Logic to determine if this specific node is the one currently highlighted
            // This is purely for visual scaling, the Observer handles the actual value
            const isVisualActive = isActive && 
                                   idx >= MIDDLE_SET_OFFSET - 2 && 
                                   idx <= MIDDLE_SET_OFFSET + ITEMS_PER_SET + 2; 

            return (
              <div
                key={`${idx}-${num}`}
                data-index={idx}
                data-value={num}
                className="sphere-item w-full h-full flex items-center justify-center snap-center cursor-pointer select-none"
                onClick={() => scrollToNumber(num, idx)}
              >
                <span
                  className={`
                    font-mono font-bold transition-all duration-200
                    ${activeDigit === num ? 'text-primary scale-110' : 'text-slate-500 scale-75'}
                  `}
                  style={{
                    fontSize: activeDigit === num ? sizeStyles.fontSize : neighborSize,
                    textShadow: activeDigit === num ? '0 0 15px rgba(250,204,20,0.8)' : 'none',
                    opacity: activeDigit === num ? 1 : 0.4
                  }}
                >
                  {num}
                </span>
              </div>
            );
          })}
        </div>

        {/* GRADIENT MASKS (To hide top/bottom edges) */}
        <div className="absolute top-0 inset-x-0 h-[25%] bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 inset-x-0 h-[25%] bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
};

// Main Input Component
function HoloSphereInput({ length = 3, value = '', onChange, disabled = false, size = 'md' }) {
  // Ensure we have an array of correct length
  const digits = Array.from({ length }, (_, i) => value[i] ? parseInt(value[i]) : 0);

  const handleDigitChange = (index, newDigit) => {
    const newDigits = [...digits];
    newDigits[index] = newDigit;
    onChange(newDigits.join(''));
  };

  return (
    <div className="flex gap-3 sm:gap-4 md:gap-6 justify-center items-center p-4">
      {digits.map((digit, index) => (
        <HoloSphere
          key={index}
          value={digit}
          onChange={(val) => handleDigitChange(index, val)}
          disabled={disabled}
          size={size}
        />
      ))}
    </div>
  );
}

export default HoloSphereInput;