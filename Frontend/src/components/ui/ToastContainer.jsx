import useToastStore from '../../store/useToastStore';

/**
 * ToastContainer - Cyber-themed notification container
 * Displays toast notifications in the top-right corner with animations
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

/**
 * Individual Toast Component
 */
function Toast({ toast, onClose }) {
  const { message, type } = toast;

  // Style configurations based on type
  const styles = {
    success: {
      border: 'border-green-500',
      icon: '✓',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
    },
    error: {
      border: 'border-red-500',
      icon: '⚠',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
    },
    warning: {
      border: 'border-yellow-500',
      icon: '⚡',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
    },
    info: {
      border: 'border-blue-500',
      icon: 'ℹ',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
  };

  const style = styles[type] || styles.info;

  return (
    <div
      className={`
        pointer-events-auto
        flex items-center gap-3 
        min-w-[300px] max-w-[400px]
        px-4 py-3
        bg-gray-900/95 backdrop-blur-md
        border-l-4 ${style.border}
        rounded-lg shadow-2xl
        animate-slideIn
      `}
    >
      {/* Icon */}
      <div className={`
        flex items-center justify-center
        w-8 h-8 rounded-full
        ${style.iconBg}
      `}>
        <span className={`text-lg ${style.iconColor}`}>{style.icon}</span>
      </div>

      {/* Message */}
      <p className="flex-1 text-white text-sm font-medium">{message}</p>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors p-1"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
