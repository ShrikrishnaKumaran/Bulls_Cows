/**
 * ProfilePage - Operative Profile / Combat License
 * 
 * Sci-Fi Tactical Interface matching the game's cyberpunk theme.
 * 
 * Design Concepts (from prompts.md):
 * 1. "Holo-ID" Operative Card header (hexagon avatar, rank, level)
 * 2. "Telemetry" Data Tiles (donut chart, digital counter, streak bars)
 * 3. "Mission Logs" folder tabs with terminal-style empty states
 * 4. Corner bracket greebles, grid background, scanlines
 * 
 * Features:
 * - Auto-refresh match history on focus / visibility change
 * - Clickable opponent names → Opponent Profile Modal
 * - Friend search & request management
 */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';

// ═══════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
  </svg>
);

const AddUserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

const OnlineIcon = () => (
  <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
);

const OfflineIcon = () => (
  <span className="w-2.5 h-2.5 bg-slate-500 rounded-full inline-block" />
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const getFormatLabel = (format, digits, difficulty) => {
  const parts = [];
  if (format) parts.push(`Bo${format}`);
  if (digits) parts.push(`${digits}D`);
  if (difficulty === 'hard') parts.push('H');
  return parts.join(' · ') || 'Bo1';
};

const getTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getRankTitle = (totalGames, wins) => {
  const winRate = totalGames > 0 ? wins / totalGames : 0;
  if (totalGames === 0) return 'ROOKIE';
  if (totalGames < 5) return 'INITIATE';
  if (totalGames < 15) return winRate >= 0.6 ? 'TACTICIAN' : 'OPERATIVE';
  if (totalGames < 30) return winRate >= 0.6 ? 'STRATEGIST' : 'VETERAN';
  if (totalGames < 50) return winRate >= 0.65 ? 'ELITE HACKER' : 'COMMANDER';
  return winRate >= 0.7 ? 'GRANDMASTER' : 'LEGEND';
};

const getLevel = (totalGames, wins) => {
  return Math.min(99, Math.floor(totalGames * 0.5 + wins * 1.5) + 1);
};

const getLevelColor = (level) => {
  if (level <= 10) return { text: 'text-cyan-400', glow: 'rgba(34,211,238,0.5)', gradient: 'bg-gradient-to-b from-cyan-300 to-cyan-600' };
  if (level <= 20) return { text: 'text-green-400', glow: 'rgba(74,222,128,0.5)', gradient: 'bg-gradient-to-b from-green-300 to-green-600' };
  return { text: 'text-orange-400', glow: 'rgba(251,146,60,0.5)', gradient: 'bg-gradient-to-b from-orange-300 to-orange-600' };
};

// ═══════════════════════════════════════════════════════════
// CORNER BRACKETS (Greeble component)
// ═══════════════════════════════════════════════════════════

const CornerBrackets = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-primary/60" />
    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-primary/60" />
    <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-primary/60" />
    <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-primary/60" />
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════
// DONUT CHART (Win Rate Telemetry)
// ═══════════════════════════════════════════════════════════

const DonutChart = ({ percentage = 0, size = 72, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 50 ? '#facc15' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#1e293b" strokeWidth={strokeWidth} />
        {/* Progress arc */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 4px ${color}66)` }} />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black font-mono text-white leading-none">
          {percentage}<span className="text-[9px] text-slate-400">%</span>
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// STREAK BARS (Signal-strength style)
// ═══════════════════════════════════════════════════════════

const StreakBars = ({ currentStreak = 0, maxBars = 5 }) => {
  const filledBars = Math.min(currentStreak, maxBars);
  return (
    <div className="flex items-end gap-0.5 h-6">
      {Array.from({ length: maxBars }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-t-sm transition-all duration-300 ${
            i < filledBars
              ? 'bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.5)]'
              : 'bg-slate-700/50'
          }`}
          style={{ height: `${((i + 1) / maxBars) * 100}%` }}
        />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// OPERATIVE CARD (Holo-ID Header — Concept #1)
// ═══════════════════════════════════════════════════════════

const OperativeCard = ({ user, stats, isOnline = true }) => {
  const username = user?.username || 'UNKNOWN';
  const uid = user?.uid || '#0000';
  const totalGames = stats?.totalGames || 0;
  const wins = stats?.wins || 0;
  const rank = getRankTitle(totalGames, wins);
  const level = getLevel(totalGames, wins);

  const levelColor = getLevelColor(level);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700 shadow-2xl mb-5">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative px-4 py-3 flex items-center gap-3">
        {/* Hexagon Avatar */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 bg-slate-800 clip-hexagon flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <span className="text-lg">👾</span>
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
            ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'}`} />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-black text-white tracking-wide uppercase truncate">
            {username}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-cyan-400 text-[11px] font-mono tracking-wider">{uid}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="text-slate-400 text-[10px] uppercase tracking-widest">{rank}</span>
          </div>
        </div>

        {/* Level Badge */}
        <div className="text-right border-l border-slate-700 pl-3 shrink-0">
          <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">Level</div>
          <div className={`text-2xl font-black text-transparent bg-clip-text font-mono ${levelColor.gradient}`}>
            {String(level).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Bottom Highlight Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// TELEMETRY TILES (Stats Grid — Concept #2)
// ═══════════════════════════════════════════════════════════

const TelemetryGrid = ({ stats, matchHistory = [] }) => {
  const wins = stats?.wins || 0;
  const losses = stats?.losses || 0;
  const totalGames = stats?.totalGames || 0;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  // Compute current win streak from actual match history (consecutive wins from most recent)
  let currentStreak = 0;
  for (const match of matchHistory) {
    if (match.result === 'win') {
      currentStreak++;
    } else {
      break;
    }
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 mb-4">
      {/* Tile A: Win Rate Donut */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/40 rounded-lg p-2 flex flex-col items-center justify-center">
        <DonutChart percentage={winRate} size={48} strokeWidth={4} />
        <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest mt-1">Win Rate</span>
      </div>

      {/* Tile B: Total Matches (Digital Counter) */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/40 rounded-lg p-2 flex flex-col items-center justify-center">
        <div className="font-mono text-2xl font-black text-white leading-none tracking-wider digital-counter">
          {String(totalGames).padStart(3, '0')}
        </div>
        <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest mt-1">Matches</span>
        <div className="flex gap-2 mt-0.5">
          <span className="text-[9px] font-mono text-green-400 font-bold">{wins}W</span>
          <span className="text-[9px] font-mono text-red-400 font-bold">{losses}L</span>
        </div>
      </div>

      {/* Tile C: Current Win Streak (Signal Bars) */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/40 rounded-lg p-2 flex flex-col items-center justify-center">
        <StreakBars currentStreak={currentStreak} maxBars={5} />
        <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest mt-1">Streak</span>
        <span className="text-[10px] font-mono font-bold text-cyan-400 mt-0.5">{currentStreak}</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// OPPONENT PROFILE MODAL
// ═══════════════════════════════════════════════════════════

const OpponentProfileModal = ({ opponentId, onClose }) => {
  const { getUserById, sendFriendRequest } = useAuthStore();
  const { addToast } = useToastStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const data = await getUserById(opponentId);
        if (mounted) setProfile(data);
      } catch {
        if (mounted) addToast('Could not load operative Profile', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { mounted = false; };
  }, [opponentId, getUserById, addToast]);

  const handleSendRequest = async () => {
    if (!profile?.uid) return;
    setActionLoading(true);
    try {
      await sendFriendRequest(profile.uid);
      setRequestSent(true);
      addToast(`Alliance request sent to ${profile.username}!`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to send request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const oStats = profile?.stats || {};
  const oTotal = oStats.totalGames || 0;
  const oWins = oStats.wins || 0;
  const oWinRate = oTotal > 0 ? Math.round((oWins / oTotal) * 100) : 0;
  const oRank = getRankTitle(oTotal, oWins);
  const oLevel = getLevel(oTotal, oWins);
  const oStreak = oStats.currentStreak || 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700 shadow-2xl">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
            </div>
          ) : profile ? (
            <div className="relative">
              {/* Close button — top right */}
              <button onClick={onClose}
                className="absolute top-2 right-2 z-10 p-.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">
                <CloseIcon />
              </button>

              {/* Header */}
              <div className="px-5 pt-5 pb-4 pr-12 flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 bg-slate-900 clip-hexagon flex items-center justify-center border border-white/20">
                    <span className="text-lg">👾</span>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                    ${profile.isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-white truncate uppercase tracking-wide">{profile.username}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-cyan-400 text-[11px] font-mono">{profile.uid}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-600" />
                    <span className="text-slate-400 text-[10px] uppercase tracking-widest">{oRank}</span>
                  </div>
                </div>
                <div className="text-right border-l border-slate-700 pl-3 shrink-0">
                  <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">Level</div>
                  <div className={`text-2xl font-black text-transparent bg-clip-text font-mono ${getLevelColor(oLevel).gradient}`}>
                    {String(oLevel).padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-1.5 mx-5 mb-3">
                <div className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-700/40">
                  <div className="text-base font-black text-white font-mono">{oWinRate}%</div>
                  <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Win Rate</div>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-700/40">
                  <div className="text-base font-black text-white font-mono">{oTotal}</div>
                  <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Matches</div>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-700/40">
                  <div className="text-base font-black text-cyan-400 font-mono">{oStreak}</div>
                  <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Streak</div>
                </div>
              </div>

              {/* Win Rate bar */}
              <div className="mx-5 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Win Rate</span>
                  <span className="text-sm font-bold font-mono text-white">{oWinRate}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${oWinRate}%`,
                      background: oWinRate >= 50
                        ? 'linear-gradient(90deg, #22d3ee 0%, #06b6d4 100%)'
                        : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)'
                    }} />
                </div>
              </div>

              {/* Member since */}
              {profile.createdAt && (
                <div className="text-center mb-3">
                  <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
                    Active since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}

              {/* Action */}
              {!profile.isSelf && (
                <div className="px-5 pb-5">
                  {profile.isFriend ? (
                    <div className="w-full py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold font-mono text-center border border-emerald-500/20 uppercase tracking-wider">
                      ✓ Allied
                    </div>
                  ) : profile.hasPendingRequest || requestSent ? (
                    <div className="w-full py-2 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs font-bold font-mono text-center border border-cyan-500/20 uppercase tracking-wider">
                      Request Transmitted
                    </div>
                  ) : profile.hasIncomingRequest ? (
                    <div className="w-full py-2 bg-cyan-500/10 text-cyan-300 rounded-lg text-xs font-bold font-mono text-center border border-cyan-500/20 uppercase tracking-wider">
                      Pending Your Authorization
                    </div>
                  ) : (
                    <button onClick={handleSendRequest} disabled={actionLoading}
                      className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-mono">
                      {actionLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                      ) : (
                        <>
                          <AddUserIcon />
                          <span>Request Alliance</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Highlight Line */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
                {'// OPERATIVE NOT FOUND'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// FRIEND SEARCH MODAL
// ═══════════════════════════════════════════════════════════

const FriendSearchModal = ({ onClose, onRequestSent }) => {
  const { searchUsers, sendFriendRequest } = useAuthStore();
  const { addToast } = useToastStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());

  const handleSearch = async () => {
    if (query.length < 2) return;
    setLoading(true);
    setError('');
    try {
      const users = await searchUsers(query);
      setResults(users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (uid) => {
    try {
      await sendFriendRequest(uid);
      setSentRequests(prev => new Set([...prev, uid]));
      addToast('Alliance request sent!', 'success');
      if (onRequestSent) onRequestSent();
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700 shadow-2xl">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative p-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white uppercase tracking-[0.15em]">
                Scan Operatives
              </h2>
            </div>

            {/* Search */}
            <div className="flex gap-2 mb-4">
              <input type="text" value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Callsign or UID (#1234)"
                className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-cyan-500/60 transition-colors placeholder:text-slate-600" />
              <button onClick={handleSearch} disabled={loading || query.length < 2}
                className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50">
                <SearchIcon />
              </button>
            </div>

            {error && <div className="text-red-400 text-[10px] font-mono mb-3">ERR: {error}</div>}

            {/* Results */}
            <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mx-auto" />
                  <p className="text-[9px] font-mono text-slate-600 mt-2 uppercase">Scanning network...</p>
                </div>
              ) : results.length > 0 ? (
                results.map((user) => (
                  <div key={user._id}
                    className="flex items-center justify-between bg-slate-800/60 rounded-lg p-3 border border-slate-700">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm uppercase tracking-wide">{user.username}</span>
                        <span className="text-cyan-400 text-[10px] font-mono">{user.uid}</span>
                      </div>
                      <div className="text-slate-500 text-[10px] font-mono">
                        {user.stats?.wins || 0}W · {user.stats?.totalGames || 0} Ops
                      </div>
                    </div>
                    <button onClick={() => handleSendRequest(user.uid)}
                      disabled={sentRequests.has(user.uid)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono transition-colors ${
                        sentRequests.has(user.uid)
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/20'
                      }`}>
                      {sentRequests.has(user.uid) ? 'Sent' : 'Add'}
                    </button>
                  </div>
                ))
              ) : query.length >= 2 && !loading ? (
                <div className="text-center py-6">
                  <p className="text-slate-500 text-xs font-mono uppercase">No operatives found</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-600 text-[10px] font-mono uppercase tracking-wider">
                    Enter callsign or UID to scan
                  </p>
                </div>
              )}
            </div>

            <button onClick={onClose}
              className="w-full mt-4 py-2.5 bg-slate-900/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700">
              [ Close ]
            </button>
          </div>

          {/* Bottom Highlight Line */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MATCH HISTORY ITEM (Mission Log Entry)
// ═══════════════════════════════════════════════════════════

const MatchHistoryItem = ({ match, onOpponentClick }) => {
  const isWin = match.result === 'win';

  return (
    <div className="group relative w-full mb-1.5">
      <div className="relative flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700 rounded-lg hover:bg-slate-800/80 transition-all duration-200">
        {/* Left edge indicator — sharp, no shadow */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg
          ${isWin ? 'bg-emerald-500' : 'bg-rose-500'}`} />

        {/* Left: Result Badge + Opponent */}
        <div className="flex items-center gap-3 pl-3 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold shrink-0 bg-slate-900 border border-slate-700
            ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isWin ? 'W' : 'L'}
          </div>

          <div className="min-w-0 flex-1">
            <button
              onClick={() => match.opponent && onOpponentClick(match.opponent)}
              className={`text-sm font-bold truncate block max-w-[150px] text-left transition-colors uppercase tracking-wide
                ${match.opponent ? 'text-white group-hover:text-cyan-400 cursor-pointer' : 'text-slate-500 cursor-default'}`}
              disabled={!match.opponent}
              title={match.opponent ? 'View Profile' : ''}>
              {match.opponentName || 'Unknown'}
            </button>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-mono mt-0.5">
              <span>{getFormatLabel(match.format, match.digits, match.difficulty)}</span>
              {match.playedAt && (
                <>
                  <span className="text-slate-700">•</span>
                  <span>{getTimeAgo(match.playedAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Score */}
        <div className="pr-1 text-right shrink-0 ml-2">
          <div className={`text-base font-mono font-black tracking-wider
            ${isWin ? 'text-white' : 'text-slate-400'}`}>
            {match.score || '0-0'}
          </div>
          {isWin && <div className="text-[9px] text-emerald-500 tracking-wider font-bold">VICTORY</div>}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// FRIEND / ALLY ITEM
// ═══════════════════════════════════════════════════════════

const FriendItem = ({ friend, onInvite, onNameClick }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700 hover:bg-slate-800/80 transition-all duration-200">
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-9 h-9 clip-hexagon bg-slate-900 flex items-center justify-center border border-white/10">
          <span className="text-sm">👾</span>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5">
          {friend.isOnline ? <OnlineIcon /> : <OfflineIcon />}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <button onClick={() => onNameClick && onNameClick(friend._id)}
            className="text-white font-bold text-sm uppercase tracking-wide hover:text-cyan-400 transition-colors cursor-pointer">
            {friend.username}
          </button>
          <span className="text-cyan-400 text-[10px] font-mono">{friend.uid}</span>
        </div>
        <div className="text-slate-500 text-[10px] font-mono">
          {friend.stats?.wins || 0}W / {friend.stats?.totalGames || 0} Ops
        </div>
      </div>
    </div>
    <button onClick={() => onInvite(friend)} disabled={!friend.isOnline}
      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest font-mono transition-all ${
        friend.isOnline
          ? 'border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black'
          : 'border border-slate-700 text-slate-600 cursor-not-allowed'
      }`}>
      Invite
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════
// FRIEND REQUEST ITEM
// ═══════════════════════════════════════════════════════════

const FriendRequestItem = ({ request, onAccept, onReject }) => {
  const user = request.from;
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-cyan-500/20 hover:bg-slate-800/80 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 clip-hexagon bg-slate-900 flex items-center justify-center border border-cyan-500/20">
          <span className="text-sm">👾</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm uppercase tracking-wide">{user?.username || 'Unknown'}</span>
            <span className="text-cyan-400 text-[10px] font-mono">{user?.uid}</span>
          </div>
          <div className="text-slate-500 text-[10px] font-mono uppercase">Requesting alliance</div>
        </div>
      </div>
      <div className="flex gap-1.5">
        <button onClick={() => onAccept(user._id)}
          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors border border-green-500/10">
          <CheckIcon />
        </button>
        <button onClick={() => onReject(user._id)}
          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/10">
          <XIcon />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN PROFILE PAGE
// ═══════════════════════════════════════════════════════════

const ProfilePage = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const {
    user,
    getProfile,
    getFriends,
    getPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState('history');
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [selectedOpponentId, setSelectedOpponentId] = useState(null);

  const fetchData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setFetchError(null);
      const profileData = await getProfile();
      setProfile(profileData);
      try {
        const [friendsData, requestsData] = await Promise.all([
          getFriends(),
          getPendingRequests()
        ]);
        setFriends(friendsData || []);
        setPendingRequests(requestsData || { incoming: [], outgoing: [] });
      } catch (friendError) {
        console.warn('Could not fetch allies data:', friendError);
        setFriends([]);
        setPendingRequests({ incoming: [], outgoing: [] });
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setFetchError('Session expired. Re-authenticate.');
      } else {
        setFetchError(error.message || 'Failed to load Profile');
      }
    } finally {
      setLoading(false);
    }
  }, [getProfile, getFriends, getPendingRequests]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }
    fetchData();
  }, [navigate, fetchData]);

  // Auto-refresh on focus
  useEffect(() => {
    const handleFocus = () => fetchData(false);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData]);

  // Auto-refresh on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchData(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchData]);

  const handleAcceptRequest = async (requesterId) => {
    try {
      const result = await acceptFriendRequest(requesterId);
      addToast(`${result.friend?.username || 'Operative'} is now your ally!`, 'success');
      const [friendsData, requestsData] = await Promise.all([getFriends(), getPendingRequests()]);
      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch {
      addToast('Failed to accept alliance request', 'error');
    }
  };

  const handleRejectRequest = async (requesterId) => {
    try {
      await rejectFriendRequest(requesterId);
      addToast('Alliance request declined', 'info');
      const requestsData = await getPendingRequests();
      setPendingRequests(requestsData);
    } catch {
      addToast('Failed to reject request', 'error');
    }
  };

  const handleInviteFriend = (friend) => {
    navigate('/online/setup', { state: { inviteFriend: friend } });
  };

  const handleOpponentClick = (opponentId) => {
    if (opponentId) {
      setSelectedOpponentId(typeof opponentId === 'object' ? opponentId._id || opponentId : opponentId);
    }
  };

  const stats = profile?.stats || { wins: 0, losses: 0, totalGames: 0 };
  const matchHistory = profile?.matchHistory || [];

  return (
    <div className="min-h-screen bg-[#0a0f1c] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-[#000000] flex flex-col font-space relative overflow-hidden">
      {/* Scanlines */}
      <div className="scanlines" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full shadow-2xl">

        {/* ─── HEADER ─── */}
        <header className="py-4 pt-8 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/home')}
              className="bg-white/5 p-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300">
              <BackIcon />
            </button>
            <div>
              <h1 className="text-base font-bold text-white uppercase tracking-[0.15em] font-mono">Profile</h1>
            </div>
          </div>
          <button onClick={() => setShowSearchModal(true)}
            className="bg-primary/10 p-2 rounded-lg text-primary hover:bg-primary/20 transition-colors border border-primary/20"
            title="Scan Operatives">
            <AddUserIcon />
          </button>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 px-4 pb-4 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3" />
              <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Loading Profile...</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-red-500 font-mono text-xs mb-2 uppercase">{'// SYSTEM ERROR'}</div>
              <p className="text-slate-400 text-sm mb-4 text-center font-mono">{fetchError}</p>
              <div className="flex gap-3">
                {fetchError.includes('Session') || fetchError.includes('expired') ? (
                  <button onClick={() => navigate('/auth')}
                    className="bg-primary text-black px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono">
                    Re-Authenticate
                  </button>
                ) : (
                  <button onClick={() => window.location.reload()}
                    className="bg-primary/20 text-primary px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono border border-primary/20">
                    [ Retry ]
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Operative Card (Holo-ID) */}
              <OperativeCard user={profile || user} stats={stats} isOnline={true} />

              {/* Telemetry Tiles */}
              <TelemetryGrid stats={stats} matchHistory={matchHistory} />

              {/* ─── FOLDER TABS (Concept #3) ─── */}
              <div className="flex gap-1 mb-4">
                {[
                  { key: 'history', label: 'Mission Logs' },
                  { key: 'allies', label: 'Allies', badge: pendingRequests.incoming.length }
                ].map((tab) => (
                  <button key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] font-mono transition-all rounded-t-lg border-b-2
                      ${activeTab === tab.key
                        ? 'bg-slate-800/60 text-white border-primary'
                        : 'bg-slate-900/30 text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50'
                      }`}>
                    {tab.label}
                    {tab.badge > 0 && (
                      <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center font-mono shadow-[0_0_6px_rgba(239,68,68,0.5)]">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ─── TAB CONTENT ─── */}
              <div className="space-y-2">
                {activeTab === 'history' ? (
                  matchHistory.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-1 px-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.15em]">
                            Recent Operations
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-600">{matchHistory.length} logged</span>
                      </div>
                      {matchHistory.slice(0, 20).map((match, index) => (
                        <MatchHistoryItem key={match._id || index} match={match}
                          onOpponentClick={handleOpponentClick} />
                      ))}
                    </>
                  ) : (
                    /* Terminal-style empty state (Concept #3) */
                    <div className="text-center py-14">
                      <div className="inline-block bg-slate-900/80 border border-slate-700/40 rounded-lg px-6 py-5">
                        <div className="font-mono text-slate-400 text-[11px] uppercase tracking-wider mb-1">
                          No combat data found
                        </div>
                        <div className="font-mono text-slate-600 text-[10px] mb-4">
                          
                        </div>
                        <div className="h-px bg-slate-700/50 mb-4" />
                        <button onClick={() => navigate('/home')}
                          className="font-mono text-primary text-xs hover:text-yellow-300 tracking-widest uppercase transition-colors drop-shadow-[0_0_6px_rgba(250,204,20,0.5)]">
                          [ Play Now ]<span className="inline-block w-[2px] h-[1em] bg-primary/80 animate-pulse align-middle ml-0.5" />
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <>
                    {/* Incoming Requests */}
                    {pendingRequests.incoming.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-2.5 px-0.5">
                          <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                          <span className="text-[9px] font-mono text-primary uppercase tracking-[0.15em] font-bold">
                            Incoming Transmissions
                          </span>
                        </div>
                        <div className="space-y-2">
                          {pendingRequests.incoming.map((request, index) => (
                            <FriendRequestItem key={index} request={request}
                              onAccept={handleAcceptRequest} onReject={handleRejectRequest} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Friends List */}
                    {friends.length > 0 ? (
                      <>
                        <div className="flex items-center gap-1.5 mb-2 px-0.5">
                          <div className="w-1 h-1 rounded-full bg-cyan-400" />
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.15em]">
                            Allied Operatives
                          </span>
                        </div>
                        {friends.map((friend) => (
                          <FriendItem key={friend._id} friend={friend} onInvite={handleInviteFriend} onNameClick={handleOpponentClick} />
                        ))}
                      </>
                    ) : pendingRequests.incoming.length === 0 && (
                      <div className="text-center py-14">
                        <div className="inline-block bg-slate-900/80 border border-slate-700/40 rounded-lg px-6 py-5">
                          <div className="font-mono text-cyan-400 text-xs mb-3 tracking-wider">
                            {'>'} <span className="opacity-60">scan</span> --allies
                          </div>
                          <div className="font-mono text-slate-500 text-[11px] uppercase tracking-wider mb-1">
                            No allies detected
                          </div>
                          <div className="font-mono text-slate-600 text-[10px] mb-4">
                            {'// Network empty'}
                          </div>
                          <div className="h-px bg-slate-700/50 mb-4" />
                          <button onClick={() => setShowSearchModal(true)}
                            className="font-mono text-primary text-xs hover:text-yellow-300 tracking-widest uppercase transition-colors drop-shadow-[0_0_6px_rgba(250,204,20,0.5)]">
                            [ Scan for operatives ]<span className="inline-block w-[2px] h-[1em] bg-cyan-400/80 animate-pulse align-middle ml-0.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </main>

        {/* ─── TECH BORDER FOOTER ─── */}
        <div className="mt-auto pt-4 pb-4 px-4 flex justify-between items-end opacity-20">
          <div className="h-12 w-12 border-l-2 border-b-2 border-white rounded-bl-xl" />
          <div className="font-mono text-[10px] text-center text-white">
            PROFILE LOADED
          </div>
          <div className="h-12 w-12 border-r-2 border-b-2 border-white rounded-br-xl" />
        </div>
      </div>

      {/* ─── MODALS ─── */}
      {showSearchModal && (
        <FriendSearchModal onClose={() => setShowSearchModal(false)}
          onRequestSent={async () => {
            try {
              const requestsData = await getPendingRequests();
              setPendingRequests(requestsData);
            } catch { /* silent */ }
          }} />
      )}

      {selectedOpponentId && (
        <OpponentProfileModal opponentId={selectedOpponentId}
          onClose={() => setSelectedOpponentId(null)} />
      )}
    </div>
  );
};

export default ProfilePage;
