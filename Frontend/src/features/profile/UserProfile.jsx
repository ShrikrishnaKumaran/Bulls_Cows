import { useEffect, useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';

const UserProfile = () => {
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h2>{user?.username}'s Profile</h2>
      
      {stats && (
        <div className="stats">
          <div className="stat-item">
            <span>Total Games:</span>
            <span>{stats.totalGames}</span>
          </div>
          <div className="stat-item">
            <span>Wins:</span>
            <span>{stats.wins}</span>
          </div>
          <div className="stat-item">
            <span>Losses:</span>
            <span>{stats.losses}</span>
          </div>
          <div className="stat-item">
            <span>Draws:</span>
            <span>{stats.draws}</span>
          </div>
          <div className="stat-item">
            <span>Win Rate:</span>
            <span>
              {stats.totalGames > 0
                ? ((stats.wins / stats.totalGames) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
