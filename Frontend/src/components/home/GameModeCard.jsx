/**
 * GameModeCard - Reusable game mode selection button
 * 
 * Used on the home page for:
 * - Pass & Play (offline)
 * - Online Duel
 * - VS Bot
 */

// Arrow icon for hover state
const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

const GameModeCard = ({ 
  icon, 
  title, 
  subtitle, 
  onClick, 
  iconBgClass, 
  iconTextClass, 
  disabled = false 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      group relative w-full p-5 rounded-xl
      bg-[#1f2937] shadow-lg
      border border-slate-700
      transition-all duration-300 ease-out
      hover:border-primary hover:shadow-neon
      hover:scale-[1.02] active:scale-[0.98]
      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-slate-700 disabled:hover:shadow-none
      overflow-hidden
    `}
  >
    <div className="relative flex items-center gap-4">
      <div className={`
        flex-shrink-0 w-14 h-14 rounded-xl
        ${iconBgClass}
        flex items-center justify-center
        ${iconTextClass}
        transition-all duration-300
        ${disabled ? 'opacity-50' : ''}
      `}>
        {icon}
      </div>
      
      <div className="text-left flex-1">
        <h3 className={`
          text-lg font-semibold text-white
          group-hover:text-primary transition-colors duration-300
          ${disabled ? 'text-slate-400 group-hover:text-slate-400' : ''}
        `}>
          {title}
        </h3>
        <p className="text-sm text-slate-400 mt-0.5">
          {subtitle}
        </p>
      </div>
      
      {!disabled && (
        <div className="
          opacity-0 group-hover:opacity-100
          transform translate-x-2 group-hover:translate-x-0
          transition-all duration-300
          text-primary
        ">
          <ArrowIcon />
        </div>
      )}
    </div>
    
    {disabled && (
      <div className="absolute top-3 right-3">
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider bg-slate-800 px-2 py-1 rounded border border-slate-700">
          Soon
        </span>
      </div>
    )}
  </button>
);

export default GameModeCard;
