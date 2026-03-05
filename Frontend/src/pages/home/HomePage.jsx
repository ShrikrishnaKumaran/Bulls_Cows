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
    <div className="h-screen bg-[#0d1520] flex flex-col font-space overflow-hidden">
      {/* Scanlines Overlay */}
      <div className="scanlines" />

      {/* Ambient glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-72 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-4">
        
        {/* ─── HEADER (Presentation Component) ─── */}
        <HomeHeader onLogout={handleLogout} />

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 flex flex-col min-h-0">

          {/* Logo Section */}
          <section className="flex items-end justify-center pt-8 pb-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold glitch-text mb-3 tracking-tight">
                <span className="text-white">BULLS</span>
                <span className="text-primary mx-2">&</span>
                <span className="text-white">COWS</span>
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500/40" />
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.3em]">Select Mode</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500/40" />
              </div>
            </div>
          </section>

          {/* Game Mode Buttons Section */}
          <section className="flex-1 flex flex-col justify-center px-1">
            <div className="space-y-8">
              <GameModeCard
                icon={<OfflineIcon />}
                title="Pass & Play"
                subtitle="Local multiplayer on one device"
                onClick={() => navigate('/offline/setup')}
                accentColor="yellow"
              />
              
              <GameModeCard
                icon={<OnlineDuelIcon />}
                title="Online Duel"
                subtitle="Play with friends via room code"
                onClick={() => setShowVsFriendModal(true)}
                accentColor="cyan"
              />
              
              <GameModeCard
                icon={<BotIcon />}
                title="Bot Arena"
                subtitle="Challenge the AI opponent"
                onClick={() => navigate('/bot/setup')}
                accentColor="purple"
              />
            </div>
          </section>

        </main>

        {/* ─── HOW TO PLAY ─── */}
        <div className="text-center shrink-0">
          <button 
            onClick={() => setShowTutorial(true)}
            className="text-base font-bold font-mono text-primary hover:text-yellow-300 tracking-widest uppercase mb-3 transition-all duration-300 drop-shadow-[0_0_8px_rgba(250,204,20,0.8)] hover:drop-shadow-[0_0_12px_rgba(250,204,20,1)] animate-pulse"
          >
            [ HOW TO PLAY ]
          </button>
        </div>
      </div>

      {/* ─── TECH BORDER FOOTER (full width, outside padded container) ─── */}
      <div className="relative z-10 shrink-0 pt-2 pb-4 px-4 flex justify-between items-end opacity-20 max-w-lg mx-auto w-full">
        <div className="h-14 w-14 border-l-2 border-b-2 border-white rounded-bl-xl"></div>
        <div className="font-mono text-[10px] text-center text-white">
          SYSTEM READY<br/>THINK • DEDUCE • CONQUER
        </div>
        <div className="h-14 w-14 border-r-2 border-b-2 border-white rounded-br-xl"></div>
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
