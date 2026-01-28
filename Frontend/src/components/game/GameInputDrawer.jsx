/**
 * GameInputDrawer - Reactor Bar Style
 * Vertically integrated command console with input slot and trigger bar
 */
import { memo } from 'react';
import HoloSphereInput from '../ui/HoloSphereInput';

const GameInputDrawer = ({ value, digits, onChange, onSubmit, disabled }) => {
  return (
    <div className="w-full flex justify-center px-3 sm:px-4">
      {/* Master Unit Container */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Top Section: Input Slot */}
        <div 
          className={`
            bg-black/40 shadow-inner p-2 relative rounded-t-2xl rounded-b-none
            ${disabled ? 'opacity-50 grayscale' : ''}
          `}
          style={{ minHeight: '90px' }}
        >
          <HoloSphereInput
            length={digits}
            value={value}
            onChange={onChange}
            disabled={disabled}
            size="sm"
          />
          
          {/* Disabled overlay */}
          {disabled && (
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          )}
        </div>

        {/* Bottom Section: Trigger Bar */}
        <button
          onClick={onSubmit}
          disabled={disabled}
          className={`
            w-full font-bold font-mono uppercase tracking-widest rounded-b-2xl rounded-t-none
            flex items-center justify-center transition-all duration-200
            transform active:scale-[0.98] border-t border-white/20
            ${disabled
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-primary hover:bg-yellow-400 text-black hover:shadow-[0_-4px_20px_rgba(250,204,21,0.5)]'
            }
          `}
          style={{ height: '50px', fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}
        >
          <span>SUBMIT GUESS</span>
          <span className="ml-2 text-lg">🎯</span>
        </button>
      </div>
    </div>
  );
};

export default memo(GameInputDrawer);
