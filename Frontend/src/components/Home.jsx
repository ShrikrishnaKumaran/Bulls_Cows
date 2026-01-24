/**
 * Home - Main Menu Screen
 * 
 * Cyber Minimalist design with:
 * - 3 game mode buttons (Offline, Online, Bot)
 * - Profile and Tutorial icons in header
 * - Animated background elements
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VsFriendModal from './VsFriendModal';

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

const OfflineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M10.5 18.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
    <path fillRule="evenodd" d="M8.625.75A3.375 3.375 0 005.25 4.125v15.75a3.375 3.375 0 003.375 3.375h6.75a3.375 3.375 0 003.375-3.375V4.125A3.375 3.375 0 0015.375.75h-6.75zM7.5 4.125C7.5 3.504 8.004 3 8.625 3h6.75c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-6.75a1.125 1.125 0 01-1.125-1.125V4.125z" clipRule="evenodd" />
  </svg>
);

const OnlineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
    <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
  </svg>
);

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M17.004 10.407c.138.435-.216.842-.672.842h-3.465a.75.75 0 01-.65-.375l-1.732-3c-.229-.396-.053-.907.393-1.004a5.252 5.252 0 016.126 3.537zM8.12 8.464c.307-.338.838-.235 1.066.154l1.732 3a.75.75 0 010 .75l-1.732 3c-.228.389-.76.492-1.066.154a5.25 5.25 0 010-7.058zM13.004 17.006c.456 0 .81.407.672.842a5.252 5.252 0 01-6.126 3.537c-.446-.097-.622-.608-.393-1.004l1.732-3a.75.75 0 01.65-.375h3.465z" />
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM4.575 15.6a8.25 8.25 0 009.348 4.425 1.966 1.966 0 00-1.84-1.275.983.983 0 01-.97-.822l-.073-.437c-.094-.565.25-1.11.8-1.267l.99-.282c.427-.123.783-.418.982-.816l.036-.073a1.453 1.453 0 012.328-.377L16.5 15h.628a2.25 2.25 0 011.983 1.186 8.25 8.25 0 00-6.345-12.4c.044.262.18.503.389.676l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.575 15.6z" clipRule="evenodd" />
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

const GameModeButton = ({ icon, title, subtitle, onClick, color, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      group relative w-full p-6 rounded-xl
      bg-gradient-to-br from-slate-800/80 to-slate-900/80
      border border-slate-700/50 hover:border-${color}-500/50
      transition-all duration-300 ease-out
      hover:shadow-lg hover:shadow-${color}-500/20
      hover:scale-[1.02] active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
      overflow-hidden
    `}
  >
    {/* Glow effect on hover */}
    <div className={`
      absolute inset-0 opacity-0 group-hover:opacity-100
      bg-gradient-to-br from-${color}-500/10 to-transparent
      transition-opacity duration-300
    `} />
    
    {/* Content */}
    <div className="relative flex items-center gap-5">
      {/* Icon container */}
      <div className={`
        flex-shrink-0 w-16 h-16 rounded-lg
        bg-gradient-to-br from-${color}-500/20 to-${color}-600/10
        border border-${color}-500/30
        flex items-center justify-center
        text-${color}-400 group-hover:text-${color}-300
        transition-colors duration-300
      `}>
        {icon}
      </div>
      
      {/* Text */}
      <div className="text-left">
        <h3 className={`
          text-xl font-semibold text-white
          group-hover:text-${color}-100 transition-colors duration-300
        `}>
          {title}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {subtitle}
        </p>
      </div>
      
      {/* Arrow indicator */}
      <div className={`
        ml-auto opacity-0 group-hover:opacity-100
        transform translate-x-2 group-hover:translate-x-0
        transition-all duration-300
        text-${color}-400
      `}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
    
    {/* Disabled overlay with "Coming Soon" */}
    {disabled && (
      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
          Coming Soon
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
      group flex items-center gap-2 px-4 py-2.5 rounded-lg
      transition-all duration-200
      ${variant === 'danger' 
        ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30' 
        : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 border border-transparent hover:border-yellow-500/30'
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        
        {/* Floating shapes */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* ─── HEADER ─── */}
        <header className="w-full px-4 sm:px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {/* Tutorial button */}
            <IconButton
              icon={<TutorialIcon />}
              label="How to Play"
              onClick={() => setShowTutorial(true)}
            />
            
            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              <IconButton
                icon={<ProfileIcon />}
                label="Profile"
                onClick={() => navigate('/profile')}
              />
              <IconButton
                icon={<LogoutIcon />}
                label="Logout"
                onClick={handleLogout}
                variant="danger"
              />
            </div>
          </div>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-md">
            
            {/* Logo / Title */}
            <div className="text-center mb-12">
              {/* Decorative line */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow-500/50" />
                <div className="w-2 h-2 bg-yellow-400 rotate-45" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-500/50" />
              </div>
              
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-bold mb-3">
                <span className="text-white">Bulls</span>
                <span className="text-yellow-400">,</span>
                <span className="text-white"> Cows</span>
                <br />
                <span className="text-yellow-400">&</span>
                <span className="text-white"> Shit</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-slate-400 text-sm tracking-widest uppercase mt-4">
                Number Guessing Game
              </p>
              
              {/* Decorative line */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-600" />
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-600" />
              </div>
            </div>

            {/* ─── GAME MODE BUTTONS ─── */}
            <div className="space-y-4">
              {/* Offline Mode */}
              <GameModeButton
                icon={<OfflineIcon />}
                title="Pass & Play"
                subtitle="Play offline with a friend on one device"
                onClick={() => navigate('/offline/setup')}
                color="emerald"
              />
              
              {/* Online Mode */}
              <GameModeButton
                icon={<OnlineIcon />}
                title="VS Friend"
                subtitle="Challenge a friend online in real-time"
                onClick={() => setShowVsFriendModal(true)}
                color="cyan"
              />
              
              {/* Bot Mode */}
              <GameModeButton
                icon={<BotIcon />}
                title="VS Bot"
                subtitle="Practice against AI opponent"
                onClick={() => {}}
                color="purple"
                disabled={true}
              />
            </div>
          </div>
        </main>

        {/* ─── FOOTER ─── */}
        <footer className="w-full px-4 py-6 text-center">
          <p className="text-slate-600 text-xs">
            v2.0.0 • Built with ❤️
          </p>
        </footer>
      </div>

      {/* ─── MODALS ─── */}
      
      {/* VS Friend Modal */}
      {showVsFriendModal && (
        <VsFriendModal onClose={() => setShowVsFriendModal(false)} />
      )}
      
      {/* Tutorial Modal */}
      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TUTORIAL MODAL
// ═══════════════════════════════════════════════════════════

const TutorialModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div 
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    />
    
    {/* Modal */}
    <div className="relative w-full max-w-lg bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="text-yellow-400">?</span> How to Play
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="font-medium text-white mb-1">Choose Your Secret</h3>
            <p className="text-slate-400 text-sm">
              Pick a 4-digit number with <span className="text-yellow-400">unique digits</span>. 
              For example: 1234, 5678, or 9021.
            </p>
          </div>
        </div>
        
        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold text-sm">
            2
          </div>
          <div>
            <h3 className="font-medium text-white mb-1">Take Turns Guessing</h3>
            <p className="text-slate-400 text-sm">
              Players alternate guessing each other&apos;s secret numbers.
            </p>
          </div>
        </div>
        
        {/* Step 3 - Results explanation */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">Understand the Feedback</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-slate-300">
                  <strong className="text-green-400">Bull</strong> = Right digit, right position
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-yellow-500 flex-shrink-0" />
                <span className="text-slate-300">
                  <strong className="text-yellow-400">Cow</strong> = Right digit, wrong position
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-slate-600 flex-shrink-0" />
                <span className="text-slate-300">
                  <strong className="text-slate-400">Shit</strong> = Digit not in secret
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Step 4 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold text-sm">
            4
          </div>
          <div>
            <h3 className="font-medium text-white mb-1">Win the Game</h3>
            <p className="text-slate-400 text-sm">
              First player to guess the opponent&apos;s secret correctly (4 Bulls) wins!
            </p>
          </div>
        </div>
        
        {/* Example */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Example:</h4>
          <div className="text-sm text-slate-400 space-y-1">
            <p>Secret: <span className="text-white font-mono">1234</span></p>
            <p>Guess:  <span className="text-white font-mono">1325</span></p>
            <p className="pt-2">
              Result: 
              <span className="inline-flex items-center gap-1 ml-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-slate-600" />
              </span>
              <span className="ml-2 text-slate-300">(1 Bull, 2 Cows, 1 Shit)</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700">
        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  </div>
);

export default Home;
