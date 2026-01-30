/**
 * ProfileHeader - Cyber-themed Profile Header Component
 * 
 * Features:
 * - Gradient ring avatar
 * - UID badge display
 * - Games played counter
 * - Online status indicator
 */
import React from 'react';

// Default SVG Avatar
const DefaultAvatar = () => (
  <svg 
    className="w-full h-full"
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const ProfileHeader = ({ user, stats, isOnline = false }) => {
  const totalGames = stats?.totalGames || 0;
  const username = user?.username || 'Unknown User';
  const uid = user?.uid || '#0000';

  return (
    <div className="bg-[#1f2937] border border-slate-700 rounded-2xl p-4 relative overflow-hidden shadow-2xl">
      {/* Background Pattern/Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
      <div className="scanlines opacity-30" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Avatar Section */}
        <div className="flex justify-center mb-3">
          <div className="relative">
            {/* Gradient Ring */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-blue-500 p-1 shadow-lg">
              <div className="w-full h-full bg-[#1f2937] rounded-full p-1">
                <div className="w-16 h-16 rounded-full border-2 border-[#1f2937] relative overflow-hidden bg-slate-600 text-slate-300 flex items-center justify-center">
                  <DefaultAvatar />
                </div>
              </div>
            </div>
            
            {/* Online/Status Badge */}
            <div className={`
              absolute bottom-0 right-0 w-5 h-5 border-2 border-[#1f2937] rounded-full
              ${isOnline ? 'bg-green-500' : 'bg-slate-600'}
            `}>
              {isOnline && (
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="text-center">
          {/* Username with UID Tag */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white">{username}</h2>
            <span className="bg-slate-700 text-primary text-xs px-2 py-0.5 rounded font-mono">
              {uid}
            </span>
          </div>
          
          {/* Games Played Subtitle */}
          <p className="text-slate-400 text-xs font-mono">
            {totalGames} {totalGames === 1 ? 'Game' : 'Games'} Played
          </p>
          
          {/* Online Status Text */}
          {isOnline && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-mono uppercase tracking-wider">
                Online
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;