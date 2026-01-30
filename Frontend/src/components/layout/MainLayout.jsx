/**
 * MainLayout - Shared layout wrapper component
 * 
 * Provides consistent styling across all pages:
 * - Cyber background with decorative blurs
 * - Scanlines overlay
 * - Responsive container
 */

const MainLayout = ({ 
  children, 
  className = '',
  maxWidth = 'max-w-md',
  centered = false,
  noPadding = false 
}) => {
  return (
    <div className={`min-h-screen bg-[#111827] flex flex-col font-space relative overflow-hidden ${className}`}>
      {/* Scanlines Overlay */}
      <div className="scanlines" />

      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Content Container */}
      <div 
        className={`
          relative z-10 flex-1 flex flex-col ${maxWidth} mx-auto w-full
          ${!noPadding ? 'px-4 sm:px-6' : ''}
          ${centered ? 'items-center justify-center' : ''}
        `}
      >
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
