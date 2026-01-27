/**
 * Auth Components - Reusable authentication UI elements
 */
import { useState } from 'react';

/**
 * AuthInput - Dark themed input with icon support and error handling
 */
export function AuthInput({ label, type = 'text', placeholder, icon, value, onChange, error = false, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${hasError ? 'text-red-500' : 'text-slate-400'}`}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-lg ${hasError ? 'text-red-500' : 'text-slate-400'}`}>
            {icon}
          </span>
        )}
        
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full bg-input-bg rounded-lg
            py-3 px-4 ${icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}
            placeholder-slate-500
            focus:outline-none focus:ring-2 focus:border-transparent
            transition-all duration-200
            ${hasError 
              ? 'border-2 border-red-500 text-red-400 focus:ring-red-500' 
              : 'border border-slate-700 text-white focus:ring-primary'
            }
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${hasError ? 'text-red-500 hover:text-red-400' : 'text-slate-400 hover:text-primary'}`}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>
      {typeof error === 'string' && error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

/**
 * PrimaryButton - Neon yellow action button
 */
export function PrimaryButton({ children, onClick, disabled = false, loading = false, ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full bg-primary text-primary-content font-bold py-3 px-6 rounded-lg
        uppercase tracking-wider text-sm
        shadow-neon hover:shadow-neon-strong
        transform hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          LOADING...
        </span>
      ) : children}
    </button>
  );
}

/**
 * TabSwitcher - Pill-shaped toggle for Login/Register
 */
export function TabSwitcher({ activeTab, onTabChange }) {
  return (
    <div className="relative flex bg-surface-dark rounded-full p-1 w-full max-w-xs mx-auto">
      <div
        className={`
          absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full
          transition-all duration-300 ease-out
          ${activeTab === 'register' ? 'left-[calc(50%+2px)]' : 'left-1'}
        `}
      />
      
      <button
        onClick={() => onTabChange('login')}
        className={`
          relative z-10 flex-1 py-2 px-4 text-sm font-semibold uppercase tracking-wider
          rounded-full transition-colors duration-200
          ${activeTab === 'login' ? 'text-primary-content' : 'text-slate-400 hover:text-white'}
        `}
      >
        Login
      </button>
      
      <button
        onClick={() => onTabChange('register')}
        className={`
          relative z-10 flex-1 py-2 px-4 text-sm font-semibold uppercase tracking-wider
          rounded-full transition-colors duration-200
          ${activeTab === 'register' ? 'text-primary-content' : 'text-slate-400 hover:text-white'}
        `}
      >
        Register
      </button>
    </div>
  );
}

/**
 * TechFooter - "Secure Connection" footer with tech borders
 */
export function TechFooter() {
  return (
    <div className="mt-8 flex justify-center">
      <div className="tech-border px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
          <span className="text-green-500">●</span>
          <span>Secure Connection</span>
          <span className="text-primary">◆</span>
        </div>
      </div>
    </div>
  );
}
