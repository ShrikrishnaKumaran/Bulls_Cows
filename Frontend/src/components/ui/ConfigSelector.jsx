/**
 * ConfigSelector - Reusable config option selector
 * 
 * A cyber-themed button group for selecting game options
 * Used in Pass & Play setup for digits and difficulty selection
 */

function ConfigSelector({ label, options, value, onChange, renderOption }) {
  return (
    <div className="mb-6">
      {/* Label */}
      <label className="block text-slate-400 text-sm font-medium mb-3 uppercase tracking-wider">
        {label}
      </label>
      
      {/* Button Group */}
      <div className="flex gap-2">
        {options.map((option) => {
          const isSelected = value === option;
          const displayText = renderOption ? renderOption(option) : option;
          
          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`
                flex-1 py-3 px-4 rounded-xl font-semibold text-sm
                border transition-all duration-200
                ${isSelected 
                  ? 'bg-primary text-black border-primary shadow-neon' 
                  : 'bg-[#1f2937] text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                }
              `}
            >
              {displayText}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ConfigSelector;
