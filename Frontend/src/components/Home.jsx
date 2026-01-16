import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VsFriendModal from './VsFriendModal';
import TournamentModal from './TournamentModal';

function Home() {
  const navigate = useNavigate();
  const [showVsFriendModal, setShowVsFriendModal] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative' }}>
        <h1>Bulls, Cows & Shit</h1>
        <button
          onClick={handleLogout}
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            padding: '8px 16px',
            cursor: 'pointer',
            border: '1px solid #dc3545',
            borderRadius: '5px',
            background: '#dc3545',
            color: 'white',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
        <button
          onClick={() => setShowVsFriendModal(true)}
          style={{
            padding: '15px',
            fontSize: '18px',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        >
          ⚔️ VS FRIEND
        </button>

        <button
          onClick={() => setShowTournamentModal(true)}
          style={{
            padding: '15px',
            fontSize: '18px',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        >
          🏆 TOURNAMENT
        </button>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px' }}>
        <button
          onClick={() => alert('Tutorial coming soon!')}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '5px',
            background: 'none'
          }}
        >
          ❓ How to Play
        </button>

        <button
          onClick={() => navigate('/profile')}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '5px',
            background: 'none'
          }}
        >
          👤 My Profile
        </button>
      </div>

      {/* Modals */}
      {showVsFriendModal && (
        <VsFriendModal onClose={() => setShowVsFriendModal(false)} />
      )}

      {showTournamentModal && (
        <TournamentModal onClose={() => setShowTournamentModal(false)} />
      )}
    </div>
  );
}

export default Home;
