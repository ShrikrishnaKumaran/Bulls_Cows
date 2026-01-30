/**
 * PlayerCard - Player information card
 * Shows player name, attempts, and active state
 */
import { memo } from 'react';

const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
  </svg>
);

const PlayerCard = ({ name, isMe, isActive, attempts, isCurrentUser = false }) => {
  const Icon = isMe ? UserIcon : UsersIcon;

  // Display name with (You) suffix for current user
  const displayName = isCurrentUser ? `${name} (You)` : name;

  // Player 1 (isMe) = Yellow, Player 2 (!isMe) = Blue
  const activeColor = isMe
    ? 'border-primary shadow-neon'
    : 'border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)]';
  const accentBg = isMe ? 'bg-primary/20' : 'bg-blue-500/20';
  const accentText = isMe ? 'text-primary' : 'text-blue-400';
  const turnBadgeBg = isMe ? 'bg-primary text-black' : 'bg-blue-500 text-white';

  return (
    <div
      className={`
        relative flex-1 bg-surface-dark/80 backdrop-blur-sm rounded-2xl p-4 border-2 transition-all duration-300
        ${isActive
          ? activeColor
          : 'border-slate-700/50 opacity-70 shadow-lg shadow-black/20'
        }
      `}
    >
      {/* TURN Badge */}
      {isActive && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${turnBadgeBg} text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-lg`}>
          Turn
        </div>
      )}

      {/* Card Content */}
      <div className="flex items-start justify-between">
        {/* Left: Icon + Name + Attempts */}
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${isActive ? accentBg + ' ' + accentText : 'bg-slate-700 text-slate-400'}
          `}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-base ${isActive ? 'text-white' : 'text-slate-400'}`}>
              {displayName}
            </h3>
            <p className="text-xs text-slate-500">
              Att: <span className={isActive ? accentText : 'text-slate-400'}>{attempts}</span>
            </p>
          </div>
        </div>

        {/* Right: Badge */}
        <span className={`
          text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
          ${isMe
            ? 'bg-primary/20 text-primary'
            : 'bg-blue-500/20 text-blue-400'
          }
        `}>
          {isMe ? 'P1' : 'P2'}
        </span>
      </div>
    </div>
  );
};

export default memo(PlayerCard);
