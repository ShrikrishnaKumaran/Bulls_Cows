/**
 * GameModeCard - Reusable game mode selection button
 * 
 * Used on the home page for:
 * - Pass & Play (offline)
 * - Online Duel
 * - VS Bot
 */

const accentMap = {
  yellow: {
    border: 'border-yellow-500/40',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    hoverBg: 'hover:bg-yellow-500/[0.08]',
    hoverBorder: 'hover:border-yellow-500/60',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]',
    activeShadow: 'active:shadow-[0_0_30px_rgba(234,179,8,0.35)]',
  },
  cyan: {
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    hoverBg: 'hover:bg-cyan-500/[0.08]',
    hoverBorder: 'hover:border-cyan-500/60',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    activeShadow: 'active:shadow-[0_0_30px_rgba(6,182,212,0.35)]',
  },
  purple: {
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    hoverBg: 'hover:bg-purple-500/[0.08]',
    hoverBorder: 'hover:border-purple-500/60',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    activeShadow: 'active:shadow-[0_0_30px_rgba(168,85,247,0.35)]',
  },
};

const GameModeCard = ({ 
  icon, 
  title, 
  subtitle, 
  onClick, 
  accentColor = 'cyan',
  disabled = false 
}) => {
  const c = accentMap[accentColor] || accentMap.cyan;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative w-full rounded-xl overflow-hidden
        bg-slate-800/40 border transition-all duration-200
        ${disabled 
          ? 'border-slate-700/30 opacity-40 cursor-not-allowed' 
          : `border-slate-700/50 ${c.hoverBorder} ${c.hoverBg} ${c.hoverShadow} hover:scale-[1.02] active:scale-[0.97] ${c.activeShadow}`
        }
      `}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${c.text.replace('text-', 'via-').replace('400', '500/30')} to-transparent`} />

      <div className="relative flex items-center gap-3 px-4 py-3.5">
        {/* Icon */}
        <div className={`
          shrink-0 w-11 h-11 rounded-lg
          ${c.bg} border ${c.border.replace('/40', '/20')}
          flex items-center justify-center ${c.text}
          transition-all duration-200
          ${!disabled ? 'group-hover:scale-110' : ''}
        `}>
          {icon}
        </div>
        
        {/* Text */}
        <div className="text-left flex-1 min-w-0">
          <h3 className={`text-sm font-black uppercase tracking-wider text-white transition-colors ${!disabled ? `group-hover:${c.text}` : ''}`}>
            {title}
          </h3>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
            {subtitle}
          </p>
        </div>

        {/* Arrow / indicator */}
        {!disabled && (
          <div className={`shrink-0 ${c.text} opacity-30 group-hover:opacity-80 transition-all duration-200`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {disabled && (
        <div className="absolute top-2.5 right-3">
          <span className="text-[8px] font-mono text-slate-600 uppercase tracking-wider bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            Soon
          </span>
        </div>
      )}
    </button>
  );
};

export default GameModeCard;
