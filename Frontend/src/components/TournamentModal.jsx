import { useState } from 'react';

function TournamentModal({ onClose }) {
  const [joinCodeInput, setJoinCodeInput] = useState('');

  const handleCreateTournament = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tournament/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: 'My League', maxParticipants: 8 })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Tournament Created!\nCode: ${data.tournamentCode}\nShare this code with participants!`);
      } else {
        alert('Failed to create tournament: ' + data.message);
      }
    } catch (error) {
      alert('Error creating tournament. Please try again.');
    }
  };

  const handleJoinTournament = async () => {
    if (!joinCodeInput.trim()) {
      alert('Please enter a tournament code');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tournament/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tournamentCode: joinCodeInput.toUpperCase() })
      });

      const data = await response.json();
      if (data.success) {
        alert('Joined tournament successfully!');
      } else {
        alert('Failed to join tournament: ' + data.message);
      }
    } catch (error) {
      alert('Error joining tournament. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '500px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>TOURNAMENT</h2>
          <button onClick={onClose} style={{ cursor: 'pointer', fontSize: '20px', border: 'none', background: 'none' }}>×</button>
        </div>

        {/* Option A: Create Tournament */}
        <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Create Tournament Lobby</h3>
          <button
            onClick={handleCreateTournament}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '5px',
              width: '100%'
            }}
          >
            Create Tournament Lobby
          </button>
        </div>

        {/* Option B: Join Tournament */}
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Join Tournament</h3>
          <input
            type="text"
            placeholder="Enter Tournament Code"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px'
            }}
          />
          <button
            onClick={handleJoinTournament}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '5px',
              width: '100%'
            }}
          >
            Join Lobby
          </button>
        </div>
      </div>
    </div>
  );
}

export default TournamentModal;
