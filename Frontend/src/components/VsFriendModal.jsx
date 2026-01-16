import { useState } from 'react';

function VsFriendModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('matchCode');
  const [roomCode, setRoomCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  const handleGenerateCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/match/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ format: 'bestOf3', difficulty: 'easy' })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedCode(data.roomId);
        setIsWaiting(true);
        alert(`Room Code: ${data.roomId}\nShare this code with your friend!`);
      } else {
        alert('Failed to create room: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error creating room. Please try again.');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCodeInput.trim()) {
      alert('Please enter a room code');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/match/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roomId: joinCodeInput.toUpperCase() })
      });

      const data = await response.json();
      if (data.success) {
        alert('Joined room successfully!');
        // TODO: Navigate to game lobby
        console.log('Match data:', data.matchData);
      } else {
        alert('Failed to join room: ' + data.message);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Error joining room. Please try again.');
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
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>VS FRIEND</h2>
          <button onClick={onClose} style={{ cursor: 'pointer', fontSize: '20px', border: 'none', background: 'none' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
          <button
            onClick={() => setActiveTab('matchCode')}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'matchCode' ? '2px solid blue' : 'none',
              fontWeight: activeTab === 'matchCode' ? 'bold' : 'normal'
            }}
          >
            Match Code
          </button>
          <button
            onClick={() => setActiveTab('inviteFriend')}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'inviteFriend' ? '2px solid blue' : 'none',
              fontWeight: activeTab === 'inviteFriend' ? 'bold' : 'normal'
            }}
          >
            Invite Friend
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'matchCode' && (
          <div>
            {/* Section A: Create Room */}
            <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
              <h3>Create Room</h3>
              <button
                onClick={handleGenerateCode}
                disabled={isWaiting}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: isWaiting ? 'not-allowed' : 'pointer',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  marginBottom: '10px'
                }}
              >
                {isWaiting ? 'Waiting...' : '➕ Generate Code'}
              </button>
              {generatedCode && (
                <div style={{ marginTop: '10px' }}>
                  <p><strong>Room Code:</strong> {generatedCode}</p>
                  <p style={{ color: isWaiting ? 'orange' : 'green' }}>
                    {isWaiting ? 'Waiting for friend to join...' : 'Room ready!'}
                  </p>
                </div>
              )}
            </div>

            {/* Section B: Join Room */}
            <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
              <h3>Join Room</h3>
              <input
                type="text"
                placeholder="Enter 4-Digit Code"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                maxLength={4}
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
                onClick={handleJoinRoom}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              >
                Join
              </button>
            </div>
          </div>
        )}

        {activeTab === 'inviteFriend' && (
          <div style={{ padding: '15px' }}>
            <h3>Friends List</h3>
            <p style={{ color: '#666' }}>Friend invitation feature coming soon...</p>
            <p style={{ color: '#666', fontSize: '14px' }}>
              (Will show your friends with online status and invite buttons)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VsFriendModal;
