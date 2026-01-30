import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PassAndPlaySetup() {
  const navigate = useNavigate();
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [difficulty, setDifficulty] = useState('4');
  const [format, setFormat] = useState('bestOf3');

  const handleStartGame = () => {
    // Pass game configuration to the game page
    const gameConfig = {
      player1: player1Name || 'Player 1',
      player2: player2Name || 'Player 2',
      difficulty: parseInt(difficulty),
      format
    };
    
    localStorage.setItem('offlineGameConfig', JSON.stringify(gameConfig));
    navigate('/game/offline');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/home')}
          style={{ 
            padding: '8px 16px', 
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '5px',
            background: 'none'
          }}
        >
          ← Back to Home
        </button>
      </div>

      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Pass & Play Setup</h1>

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
        <h3>Player Names</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Player 1:</label>
          <input
            type="text"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            placeholder="Enter Player 1 name"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Player 2:</label>
          <input
            type="text"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            placeholder="Enter Player 2 name"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
        <h3>Difficulty (Number Length)</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['3', '4', '5', '6'].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                border: difficulty === level ? '2px solid blue' : '1px solid #ccc',
                borderRadius: '5px',
                background: difficulty === level ? '#e3f2fd' : 'white',
                fontWeight: difficulty === level ? 'bold' : 'normal'
              }}
            >
              {level} Digits {level === '3' && '(Easy)'} {level === '4' && '(Medium)'} {level === '5' && '(Hard)'} {level === '6' && '(Expert)'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
        <h3>Game Format</h3>
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <button
            onClick={() => setFormat('bestOf1')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              border: format === 'bestOf1' ? '2px solid blue' : '1px solid #ccc',
              borderRadius: '5px',
              background: format === 'bestOf1' ? '#e3f2fd' : 'white',
              fontWeight: format === 'bestOf1' ? 'bold' : 'normal'
            }}
          >
            Single Round
          </button>
          <button
            onClick={() => setFormat('bestOf3')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              border: format === 'bestOf3' ? '2px solid blue' : '1px solid #ccc',
              borderRadius: '5px',
              background: format === 'bestOf3' ? '#e3f2fd' : 'white',
              fontWeight: format === 'bestOf3' ? 'bold' : 'normal'
            }}
          >
            Best of 3
          </button>
          <button
            onClick={() => setFormat('bestOf5')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              border: format === 'bestOf5' ? '2px solid blue' : '1px solid #ccc',
              borderRadius: '5px',
              background: format === 'bestOf5' ? '#e3f2fd' : 'white',
              fontWeight: format === 'bestOf5' ? 'bold' : 'normal'
            }}
          >
            Best of 5
          </button>
        </div>
      </div>

      <button
        onClick={handleStartGame}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '20px',
          cursor: 'pointer',
          border: 'none',
          borderRadius: '10px',
          background: '#4CAF50',
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        Start Game 🎮
      </button>

      <div style={{ marginTop: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
        <h4>How Pass & Play Works:</h4>
        <ul style={{ marginLeft: '20px' }}>
          <li>Both players use the same device</li>
          <li>Each player sets their secret number</li>
          <li>Players take turns guessing</li>
          <li>Pass the device after each turn</li>
          <li>First to crack the code wins!</li>
        </ul>
      </div>
    </div>
  );
}

export default PassAndPlaySetup;
