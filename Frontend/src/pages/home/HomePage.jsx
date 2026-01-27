/**
 * HomePage - Main Menu Screen (Container Component)
 * 
 * Follows Container vs Presentation pattern:
 * - Container: Manages state and navigation logic
 * - Presentation: Delegates UI to HomeHeader and GameModeCard components
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VsFriendModal from '../../components/lobby/VsFriendModal';
import GameRulesModal from '../../components/game/GameRulesModal';
import { HomeHeader, GameModeCard } from '../../components/home';

// ═══════════════════════════════════════════════════════════
// ICONS (SVG Components)
// ═══════════════════════════════════════════════════════════

// Offline - Mobile/Device icon
const OfflineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M10.5 18.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
    <path fillRule="evenodd" d="M8.625.75A3.375 3.375 0 005.25 4.125v15.75a3.375 3.375 0 003.375 3.375h6.75a3.375 3.375 0 003.375-3.375V4.125A3.375 3.375 0 0015.375.75h-6.75zM7.5 4.125C7.5 3.504 8.004 3 8.625 3h6.75c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-6.75a1.125 1.125 0 01-1.125-1.125V4.125z" clipRule="evenodd" />
  </svg>
);

// Online Duel - Crossed Swords icon
const OnlineDuelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M4.5 2L6 3.5V5.5L5.5 6H3.5L2 4.5L4.5 2ZM7 6.5L17.5 17L19 21L15 19.5L4.5 9L7 6.5Z" />
    <path d="M19.5 2L18 3.5V5.5L18.5 6H20.5L22 4.5L19.5 2ZM17 6.5L6.5 17L5 21L9 19.5L19.5 9L17 6.5Z" opacity="0.7" />
  </svg>
);

// VS Bot - CPU/Chip icon
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M16.5 7.5h-9v9h9v-9z" />
    <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT (Container)
// ═══════════════════════════════════════════════════════════

function HomePage() {
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
        
        {/* ─── HEADER (Presentation Component) ─── */}
        <HomeHeader onLogout={handleLogout} />

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-md">
            
            {/* Logo / Title */}
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

            {/* ─── GAME MODE BUTTONS (Presentation Components) ─── */}
            <div className="space-y-4">
              <GameModeCard
                icon={<OfflineIcon />}
                title="Pass & Play"
                subtitle="Local multiplayer on one device"
                onClick={() => navigate('/offline/setup')}
                iconBgClass="bg-yellow-500/10"
                iconTextClass="text-yellow-400"
              />
              
              <GameModeCard
                icon={<OnlineDuelIcon />}
                title="Online Duel"
                subtitle="Play with friends via room code"
                onClick={() => setShowVsFriendModal(true)}
                iconBgClass="bg-blue-500/10"
                iconTextClass="text-blue-400"
              />
              
              <GameModeCard
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
      {showVsFriendModal && (
        <VsFriendModal onClose={() => setShowVsFriendModal(false)} />
      )}
      
      {showTutorial && (
        <GameRulesModal onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}

export default HomePage;
