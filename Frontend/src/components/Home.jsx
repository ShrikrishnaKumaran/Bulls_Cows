import { useState } from 'react';
import VsFriendModal from './VsFriendModal';
import TournamentModal from './TournamentModal';

function Home() {
  const [showVsFriendModal, setShowVsFriendModal] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>Bulls, Cows & Shit</h1>
      </div>

      {/* Main Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
        <button
          onClick={() => window.location.href = '/setup/local'}
          style={{
            padding: '15px',
            fontSize: '18px',
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        >
          📱 PASS & PLAY
        </button>

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
          onClick={() => window.location.href = '/tutorial'}
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
          onClick={() => window.location.href = '/profile'}
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
