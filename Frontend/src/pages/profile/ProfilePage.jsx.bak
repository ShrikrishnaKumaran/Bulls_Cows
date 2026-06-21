/**
 * ProfilePage - User Profile Dashboard
 * 
 * Redesigned to match app styling (HomePage, SetupPage pattern)
 * 
 * Features:
 * - User Info with UID display
 * - Chess.com style stats bar
 * - Tab system: Match History | Allies (Friends)
 * - Friend search modal
 * - Friend request management
 */
import { useEffect, useState, useMemo } from 'react';
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

// Default SVG Avatar
const DefaultAvatar = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════
// PROFILE HEADER SECTION
// ═══════════════════════════════════════════════════════════

const ProfileSection = ({ user, stats, isOnline = true }) => {
  const totalGames = stats?.totalGames || 0;
  const username = user?.username || 'Unknown User';
  const uid = user?.uid || '#0000';

  return (
    <div className="text-center mb-4">
      {/* Avatar with Gradient Ring */}
      <div className="flex justify-center mb-2">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-blue-500 p-0.5">
            <div className="w-full h-full bg-[#111827] rounded-full p-0.5 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center overflow-hidden">
                <DefaultAvatar />
              </div>
            </div>
          </div>
          {/* Online Status */}
          <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-[#111827] rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-600'}`} />
        </div>
      </div>

      {/* Username */}
      <h2 className="text-lg font-bold text-white mb-0.5">{username}</h2>
      
      {/* UID Badge */}
      <div className="inline-flex items-center bg-slate-800 px-2 py-0.5 rounded-full mb-1">
        <span className="text-primary text-xs font-mono font-bold">{uid}</span>
      </div>
      
      {/* Games Played */}
      <p className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">
        {totalGames} {totalGames === 1 ? 'Game' : 'Games'} Played
      </p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// STATS BAR COMPONENT (Chess.com Style)
// ═══════════════════════════════════════════════════════════

const StatsBar = ({ wins = 0, losses = 0 }) => {
  const total = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const lossRate = total > 0 ? Math.round((losses / total) * 100) : 0;
  
  const percentages = useMemo(() => {
    if (total === 0) return { win: 50, loss: 50 };
    return {
      win: (wins / total) * 100,
      loss: (losses / total) * 100
    };
  }, [wins, losses, total]);

  return (
    <div className="relative rounded-lg overflow-hidden">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-800/80 backdrop-blur-xl" />
      
      {/* Border */}
      <div className="absolute inset-0 rounded-lg border border-slate-600/30" />
      
      {/* Content */}
      <div className="relative z-10 px-3 py-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Combat Record
          </h3>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[7px] font-mono text-cyan-400/80">LIVE</span>
          </div>
        </div>

        {/* Stats Row - Inline */}
        <div className="flex items-center justify-around mb-2">
          {/* Victories */}
          <div className="text-center">
            <span className="text-[8px] font-mono text-green-500 uppercase">Victories</span>
            <div className="text-2xl font-black text-white leading-none">{wins}</div>
            <span className="text-[8px] text-slate-500 font-mono">{winRate}%</span>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-700" />

          {/* Defeats */}
          <div className="text-center">
            <span className="text-[8px] font-mono text-red-500 uppercase">Defeats</span>
            <div className="text-2xl font-black text-white leading-none">{losses}</div>
            <span className="text-[8px] text-slate-500 font-mono">{lossRate}%</span>
          </div>
        </div>

        {/* Power Gauge - Compact */}
        <div className="relative h-1.5 rounded-full overflow-hidden bg-slate-900/80">
          <div 
            className="absolute top-0 left-0 h-full rounded-l-full"
            style={{ 
              width: `${percentages.win}%`,
              background: 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)'
            }}
          />
          <div 
            className="absolute top-0 right-0 h-full rounded-r-full"
            style={{ 
              width: `${percentages.loss}%`,
              background: 'linear-gradient(270deg, #ef4444 0%, #f87171 100%)'
            }}
          />
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
      addToast('🚀 Friend request sent!', 'success');
      if (onRequestSent) onRequestSent();
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#1f2937] rounded-2xl p-5 w-full max-w-sm border border-slate-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
          Find Players
        </h2>
        
        {/* Search Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Username or UID (#1234)"
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSearch}
            disabled={loading || query.length < 2}
            className="bg-primary hover:bg-yellow-400 text-black px-4 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            <SearchIcon />
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-xs font-mono mb-3">{error}</div>
        )}

        {/* Results */}
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
            </div>
          ) : results.length > 0 ? (
            results.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{user.username}</span>
                    <span className="text-primary text-xs font-mono">{user.uid}</span>
                  </div>
                  <div className="text-slate-500 text-xs font-mono">
                    {user.stats?.wins || 0}W • {user.stats?.totalGames || 0} Games
                  </div>
                </div>
                <button
                  onClick={() => handleSendRequest(user.uid)}
                  disabled={sentRequests.has(user.uid)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                    sentRequests.has(user.uid)
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-primary/20 text-primary hover:bg-primary/30'
                  }`}
                >
                  {sentRequests.has(user.uid) ? 'Sent' : 'Add'}
                </button>
              </div>
            ))
          ) : query.length >= 2 && !loading ? (
            <div className="text-slate-500 text-center py-6 text-sm">No players found</div>
          ) : (
            <div className="text-slate-600 text-center py-6 text-xs font-mono">
              Search by username or UID (e.g., #1234)
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MATCH HISTORY ITEM
// ═══════════════════════════════════════════════════════════

const MatchHistoryItem = ({ match }) => {
  const isWin = match.result === 'win';

  return (
    <div className={`
      flex items-center justify-between p-3 rounded-xl border
      ${isWin ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}
    `}>
      <div className="flex items-center gap-3">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm
          ${isWin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
        `}>
          {isWin ? 'W' : 'L'}
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{match.opponentName || 'Unknown'}</div>
          <div className="text-slate-500 text-xs font-mono">Bo{match.format || 1}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-white font-mono font-bold">{match.score || '0-0'}</div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// FRIEND ITEM
// ═══════════════════════════════════════════════════════════

const FriendItem = ({ friend, onInvite }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden text-slate-400">
            <DefaultAvatar className="w-6 h-6" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5">
            {friend.isOnline ? <OnlineIcon /> : <OfflineIcon />}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{friend.username}</span>
            <span className="text-primary text-xs font-mono">{friend.uid}</span>
          </div>
          <div className="text-slate-500 text-xs font-mono">
            {friend.stats?.wins || 0}W / {friend.stats?.totalGames || 0}G
          </div>
        </div>
      </div>
      <button
        onClick={() => onInvite(friend)}
        disabled={!friend.isOnline}
        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
          friend.isOnline
            ? 'border border-primary/50 text-primary hover:bg-primary hover:text-black'
            : 'border border-slate-600 text-slate-500 cursor-not-allowed'
        }`}
      >
        Invite
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// FRIEND REQUEST ITEM
// ═══════════════════════════════════════════════════════════

const FriendRequestItem = ({ request, onAccept, onReject }) => {
  const user = request.from;
  
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden text-primary">
          <DefaultAvatar className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{user?.username || 'Unknown'}</span>
            <span className="text-primary text-xs font-mono">{user?.uid}</span>
          </div>
          <div className="text-slate-500 text-xs font-mono">Wants to be allies</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(user._id)}
          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
        >
          <CheckIcon />
        </button>
        <button
          onClick={() => onReject(user._id)}
          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
        >
          <XIcon />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN PROFILE PAGE COMPONENT
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

  // Fetch all data
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setFetchError(null);
        
        const profileData = await getProfile();
        if (!isMounted) return;
        setProfile(profileData);
        
        try {
          const [friendsData, requestsData] = await Promise.all([
            getFriends(),
            getPendingRequests()
          ]);
          if (!isMounted) return;
          setFriends(friendsData || []);
          setPendingRequests(requestsData || { incoming: [], outgoing: [] });
        } catch (friendError) {
          console.warn('Could not fetch friends data:', friendError);
          if (isMounted) {
            setFriends([]);
            setPendingRequests({ incoming: [], outgoing: [] });
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        if (isMounted) {
          const is401 = error.response?.status === 401;
          if (is401) {
            localStorage.removeItem('token');
            setFetchError('Session expired. Please log in again.');
          } else {
            setFetchError(error.message || 'Failed to load profile');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    fetchData();
    
    return () => { isMounted = false; };
  }, [navigate, getProfile, getFriends, getPendingRequests]);

  const handleAcceptRequest = async (requesterId) => {
    try {
      const result = await acceptFriendRequest(requesterId);
      addToast(`✅ ${result.friend?.username || 'User'} is now your ally!`, 'success');
      
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getPendingRequests()
      ]);
      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch (error) {
      console.error('Failed to accept request:', error);
      addToast('Failed to accept friend request', 'error');
    }
  };

  const handleRejectRequest = async (requesterId) => {
    try {
      await rejectFriendRequest(requesterId);
      addToast('Friend request declined', 'info');
      
      const requestsData = await getPendingRequests();
      setPendingRequests(requestsData);
    } catch (error) {
      console.error('Failed to reject request:', error);
      addToast('Failed to reject friend request', 'error');
    }
  };

  const handleInviteFriend = (friend) => {
    navigate('/online/setup', { state: { inviteFriend: friend } });
  };

  const stats = profile?.stats || { wins: 0, losses: 0, totalGames: 0 };
  const matchHistory = profile?.matchHistory || [];

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col font-space relative overflow-hidden">
      {/* Scanlines Overlay */}
      <div className="scanlines" />

      {/* Content Container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full shadow-2xl bg-[#111827]">
        
        {/* ─── HEADER ─── */}
        <header className="py-4 pt-8 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="bg-white/5 p-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300"
            >
              <BackIcon />
            </button>
            <h1 className="text-lg font-bold text-white uppercase tracking-wider">Profile</h1>
          </div>
          <button
            onClick={() => setShowSearchModal(true)}
            className="bg-primary/20 p-2 rounded-full text-primary hover:bg-primary/30 transition-colors"
            title="Find Players"
          >
            <AddUserIcon />
          </button>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 px-4 pb-4 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-slate-400 text-sm mb-4 text-center">{fetchError}</p>
              <div className="flex gap-3">
                {fetchError.includes('Session') || fetchError.includes('expired') ? (
                  <button
                    onClick={() => navigate('/auth')}
                    className="bg-primary text-black px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider"
                  >
                    Go to Login
                  </button>
                ) : (
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-primary/20 text-primary px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Profile Section */}
              <ProfileSection 
                user={profile || user}
                stats={stats}
                isOnline={true}
              />

              {/* Stats Bar */}
              <div className="mb-6">
                <StatsBar 
                  wins={stats.wins} 
                  losses={stats.losses} 
                />
              </div>

              {/* Tab Navigation - Cyber Underline Style */}
              <div className="flex w-full border-b border-white/10 mb-6">
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 text-center py-3 text-sm font-bold tracking-widest cursor-pointer transition-all relative ${
                    activeTab === 'history'
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  HISTORY
                  {activeTab === 'history' && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary shadow-[0_-2px_10px_rgba(250,204,20,0.5)]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('allies')}
                  className={`flex-1 text-center py-3 text-sm font-bold tracking-widest cursor-pointer transition-all relative ${
                    activeTab === 'allies'
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  ALLIES
                  {activeTab === 'allies' && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary shadow-[0_-2px_10px_rgba(250,204,20,0.5)]" />
                  )}
                  {pendingRequests.incoming.length > 0 && (
                    <span className="absolute top-1 right-4 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                      {pendingRequests.incoming.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-3">
                {activeTab === 'history' ? (
                  matchHistory.length > 0 ? (
                    matchHistory.slice(0, 10).map((match, index) => (
                      <MatchHistoryItem key={index} match={match} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">🎮</div>
                      <p className="text-slate-400 text-sm font-semibold">No matches yet</p>
                      <p className="text-slate-600 text-xs mt-1 font-mono">Play online to build your history</p>
                    </div>
                  )
                ) : (
                  <>
                    {/* Incoming Requests */}
                    {pendingRequests.incoming.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                          Incoming Transmissions
                        </h3>
                        <div className="space-y-2">
                          {pendingRequests.incoming.map((request, index) => (
                            <FriendRequestItem
                              key={index}
                              request={request}
                              onAccept={handleAcceptRequest}
                              onReject={handleRejectRequest}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Friends List */}
                    {friends.length > 0 ? (
                      friends.map((friend) => (
                        <FriendItem 
                          key={friend._id} 
                          friend={friend} 
                          onInvite={handleInviteFriend}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-4">👥</div>
                        <p className="text-slate-400 text-sm font-semibold">No allies yet</p>
                        <button
                          onClick={() => setShowSearchModal(true)}
                          className="text-primary text-xs mt-2 hover:underline font-mono"
                        >
                          [ SEARCH FOR PLAYERS ]
                        </button>
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
          <div className="h-12 w-12 border-l-2 border-b-2 border-white rounded-bl-xl"></div>
          <div className="font-mono text-[10px] text-center text-white">
            PROFILE DATA<br/>LOADED
          </div>
          <div className="h-12 w-12 border-r-2 border-b-2 border-white rounded-br-xl"></div>
        </div>
      </div>

      {/* ─── SEARCH MODAL ─── */}
      {showSearchModal && (
        <FriendSearchModal 
          onClose={() => setShowSearchModal(false)} 
          onRequestSent={async () => {
            try {
              const requestsData = await getPendingRequests();
              setPendingRequests(requestsData);
            } catch (error) {
              console.error('Failed to refresh requests:', error);
            }
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
