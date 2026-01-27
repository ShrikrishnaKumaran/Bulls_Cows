/**
 * ProfilePage - User Profile and Stats
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';

// Back Icon
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
  </svg>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setStats(response.data.stats);
      } catch (error) {
        // Error fetching profile
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col font-space">
      <div className="scanlines" />
      
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-4">
        {/* Header */}
        <header className="py-6 pt-10 flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="bg-white/5 p-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all text-slate-300"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold text-white">Profile</h1>
        </header>

        {/* Profile Content */}
        <main className="flex-1 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👤</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {user?.username || 'Player'}
                </h2>
                <p className="text-slate-400 text-sm">{user?.email || ''}</p>
              </div>

              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#1f2937] rounded-xl p-4 border border-slate-700 text-center">
                    <p className="text-3xl font-bold text-white mb-1">{stats.totalGames || 0}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Total Games</p>
                  </div>
                  <div className="bg-[#1f2937] rounded-xl p-4 border border-slate-700 text-center">
                    <p className="text-3xl font-bold text-green-400 mb-1">{stats.wins || 0}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Wins</p>
                  </div>
                  <div className="bg-[#1f2937] rounded-xl p-4 border border-slate-700 text-center">
                    <p className="text-3xl font-bold text-red-400 mb-1">{stats.losses || 0}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Losses</p>
                  </div>
                  <div className="bg-[#1f2937] rounded-xl p-4 border border-slate-700 text-center">
                    <p className="text-3xl font-bold text-primary mb-1">
                      {stats.totalGames > 0
                        ? Math.round((stats.wins / stats.totalGames) * 100)
                        : 0}%
                    </p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Win Rate</p>
                  </div>
                </div>
              )}

              {/* Coming Soon Features */}
              <div className="bg-[#1f2937] rounded-xl p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Coming Soon
                </h3>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">◆</span> Match History
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">◆</span> Achievements
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">◆</span> Leaderboard
                  </li>
                </ul>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
