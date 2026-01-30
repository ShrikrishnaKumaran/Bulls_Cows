/**
 * TechTile - Interactive Selection Tile Component
 * 
 * Reusable selection tile with icon and label for config options.
 * Supports multiple accent colors: primary (yellow), green, red.
 */

export const TechTile = ({ icon, label, selected, onClick, accentColor = 'primary' }) => {
  const colorClasses = {
    primary: {
      selected: 'border-primary bg-primary/10 shadow-neon text-white ring-1 ring-primary',
      icon: 'text-primary',
    },
    green: {
      selected: 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)] text-white ring-1 ring-green-500',
      icon: 'text-green-400',
    },
    red: {
      selected: 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)] text-white ring-1 ring-red-500',
      icon: 'text-red-400',
    },
  };

  const colors = colorClasses[accentColor] || colorClasses.primary;

  return (
    <button
      onClick={onClick}
      className={`
        bg-[#111827] border rounded-xl p-4 flex flex-col items-center justify-center gap-2
        cursor-pointer transition-all duration-200 hover:border-slate-500 hover:brightness-110
        ${selected
          ? colors.selected
          : 'border-slate-700 text-slate-400 opacity-70'
        }
      `}
    >
      <div className={selected ? colors.icon : 'text-slate-500'}>
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
};

export default TechTile;
