/**
 * Home - Main Menu Screen
 * 
 * Cyber Minimalist design matching the Auth page with:
 * - 3 game mode buttons (Offline, Online Duel, VS Bot)
 * - Profile and Tutorial icons in header
 * - Matching color scheme (primary yellow, secondary blue)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VsFriendModal from './VsFriendModal';
import GameRulesModal from './GameRulesModal';

// ═══════════════════════════════════════════════════════════
// ICONS (SVG Components)
// ═══════════════════════════════════════════════════════════

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const TutorialIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);

// Offline - Mobile/Device icon
const OfflineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M10.5 18.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
    <path fillRule="evenodd" d="M8.625.75A3.375 3.375 0 005.25 4.125v15.75a3.375 3.375 0 003.375 3.375h6.75a3.375 3.375 0 003.375-3.375V4.125A3.375 3.375 0 0015.375.75h-6.75zM7.5 4.125C7.5 3.504 8.004 3 8.625 3h6.75c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-6.75a1.125 1.125 0 01-1.125-1.125V4.125z" clipRule="evenodd" />
  </svg>
);

// Online Duel - Crossed Swords icon (matching attachment exactly)
const OnlineDuelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    {/* Sword 1 - top-left to bottom-right */}
    <path d="M4.5 2L6 3.5V5.5L5.5 6H3.5L2 4.5L4.5 2ZM7 6.5L17.5 17L19 21L15 19.5L4.5 9L7 6.5Z" />
    {/* Sword 2 - top-right to bottom-left */}
    <path d="M19.5 2L18 3.5V5.5L18.5 6H20.5L22 4.5L19.5 2ZM17 6.5L6.5 17L5 21L9 19.5L19.5 9L17 6.5Z" opacity="0.7" />
  </svg>
);

// VS Bot - CPU/Chip icon (matching the attachment)
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M16.5 7.5h-9v9h9v-9z" />
    <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// GAME MODE BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════

const GameModeButton = ({ icon, title, subtitle, onClick, iconBgClass, iconTextClass, disabled = false }) => (
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
    {/* Content */}
    <div className="relative flex items-center gap-4">
      {/* Icon container with specific background colors */}
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
      
      {/* Text */}
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
      
      {/* Arrow indicator */}
      {!disabled && (
        <div className="
          opacity-0 group-hover:opacity-100
          transform translate-x-2 group-hover:translate-x-0
          transition-all duration-300
          text-primary
        ">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
    
    {/* Disabled overlay with "Coming Soon" */}
    {disabled && (
      <div className="absolute top-3 right-3">
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider bg-slate-800 px-2 py-1 rounded border border-slate-700">
          Soon
        </span>
      </div>
    )}
  </button>
);

// ═══════════════════════════════════════════════════════════
// ICON BUTTON COMPONENT (for header)
// ═══════════════════════════════════════════════════════════

const IconButton = ({ icon, label, onClick, variant = 'default' }) => (
  <button
    onClick={onClick}
    className={`
      group flex items-center gap-2 px-3 py-2 rounded-lg
      transition-all duration-200
      ${variant === 'danger' 
        ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
      }
    `}
    title={label}
  >
    <span className="transition-transform duration-200 group-hover:scale-110">
      {icon}
    </span>
    <span className="text-sm font-medium hidden sm:inline">{label}</span>
  </button>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

function Home() {
  const navigate = useNavigate();
  const [showVsFriendModal, setShowVsFriendModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col font-space relative overflow-hidden">
      {/* Scanlines Overlay */}
      <div className="scanlines" />

      {/* Content container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full shadow-2xl bg-[#111827]">
        
        {/* ─── HEADER ─── */}
        <header className="w-full px-4 sm:px-6 py-4 pt-10">
          <div className="flex items-center justify-between">
            {/* Logout - Top Left (Glass Button) */}
            <button
              onClick={handleLogout}
              className="bg-white/5 p-3 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-red-400/80 hover:text-red-400"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Profile - Top Right (Glass Button) */}
            <button
              onClick={() => navigate('/profile')}
              className="bg-white/5 p-3 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300 hover:text-white"
              title="Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-md">
            
            {/* Logo / Title - matching attachment style */}
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold glitch-text mb-3 tracking-tight">
                <span className="text-white">BULLS</span>
                <span className="text-primary mx-2">&</span>
                <span className="text-white">COWS</span>
              </h1>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-primary to-transparent" />
              </div>
              <p className="text-slate-400 text-sm uppercase tracking-widest">
                Number Guessing Game
              </p>
            </div>

            {/* ─── GAME MODE BUTTONS ─── */}
            <div className="space-y-4">
              {/* Offline Mode - Yellow */}
              <GameModeButton
                icon={<OfflineIcon />}
                title="Pass & Play"
                subtitle="Local multiplayer on one device"
                onClick={() => navigate('/offline/setup')}
                iconBgClass="bg-yellow-500/10"
                iconTextClass="text-yellow-400"
              />
              
              {/* Online Mode - Blue */}
              <GameModeButton
                icon={<OnlineDuelIcon />}
                title="Online Duel"
                subtitle="Play with friends via room code"
                onClick={() => setShowVsFriendModal(true)}
                iconBgClass="bg-blue-500/10"
                iconTextClass="text-blue-400"
              />
              
              {/* Bot Mode - Purple */}
              <GameModeButton
                icon={<BotIcon />}
                title="VS Bot"
                subtitle="Challenge the AI"
                onClick={() => {}}
                iconBgClass="bg-purple-500/10"
                iconTextClass="text-purple-400"
                disabled={true}
              />
            </div>
          </div>
        </main>

        {/* ─── HELP LINK ─── */}
        <div className="text-center">
          <button 
            onClick={() => setShowTutorial(true)}
            className="text-sm font-semibold font-mono text-primary/70 hover:text-primary tracking-widest uppercase mb-6 transition-colors"
          >
            [ HOW TO PLAY ]
          </button>
        </div>

        {/* ─── TECH BORDER FOOTER ─── */}
        <div className="mt-auto pt-8 pb-4 px-4 flex justify-between items-end opacity-20">
          <div className="h-16 w-16 border-l-2 border-b-2 border-white rounded-bl-xl"></div>
          <div className="font-mono text-[10px] text-center text-white">
            SYSTEM READY<br/>V2.0.0
          </div>
          <div className="h-16 w-16 border-r-2 border-b-2 border-white rounded-br-xl"></div>
        </div>
      </div>

      {/* ─── MODALS ─── */}
      
      {/* VS Friend Modal */}
      {showVsFriendModal && (
        <VsFriendModal onClose={() => setShowVsFriendModal(false)} />
      )}
      
      {/* Game Rules Modal */}
      {showTutorial && (
        <GameRulesModal onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}

export default Home;
