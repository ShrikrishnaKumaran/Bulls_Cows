/**
 * Button Component - Reusable button with variants
 * Pure presentation component
 */
import { memo } from 'react';
import { BUTTON_VARIANT } from '../../utils/constants';

const variantStyles = {
  [BUTTON_VARIANT.PRIMARY]: `
    bg-primary hover:bg-yellow-400 text-black font-bold
    shadow-neon hover:shadow-neon-strong
    disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none
  `,
  [BUTTON_VARIANT.SECONDARY]: `
    bg-surface-dark/80 backdrop-blur-sm text-slate-300 border border-slate-700/50
    hover:bg-slate-700 hover:border-slate-600
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  [BUTTON_VARIANT.DANGER]: `
    bg-red-600 hover:bg-red-700 text-white font-semibold
    shadow-lg hover:shadow-xl
    disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none
  `,
  [BUTTON_VARIANT.GHOST]: `
    bg-transparent text-slate-300 border border-slate-700
    hover:bg-slate-800 hover:border-slate-600
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
};

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = BUTTON_VARIANT.PRIMARY,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = `
    px-6 py-3 rounded-full font-semibold uppercase tracking-wider
    transition-all duration-300 transform
    hover:scale-[1.02] active:scale-[0.98]
    disabled:cursor-not-allowed disabled:hover:scale-100
    ${fullWidth ? 'w-full' : ''}
  `;

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`.trim().replace(/\s+/g, ' ')}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default memo(Button);
