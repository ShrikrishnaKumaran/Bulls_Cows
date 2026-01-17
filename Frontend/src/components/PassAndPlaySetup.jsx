import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOfflineGameStore from '../store/useOfflineGameStore';
import { validateInput } from '../utils/gameRules';

function PassAndPlaySetup() {
  const navigate = useNavigate();
  const { setPlayer1Secret, setPlayer2Secret, setDigits, startGame } = useOfflineGameStore();
  
  const [digits, setDigitsLocal] = useState(4);
  const [step, setStep] = useState(1); // 1 = Player 1, 2 = Player 2
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const handleDigitSelect = (digit) => {
    if (secret.length < digits && !secret.includes(digit)) {
      setSecret(secret + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setSecret(secret.slice(0, -1));
    setError('');
  };

  const handleSubmit = () => {
    const validation = validateInput(secret, digits);
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    if (step === 1) {
      setPlayer1Secret(secret);
      setStep(2);
      setSecret('');
      setError('');
    } else {
      setPlayer2Secret(secret);
      setDigits(digits);
      const result = startGame();
      
      if (result.success) {
        navigate('/offline/game');
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Pass & Play Setup</h1>
        <p style={{ color: '#666' }}>
          {step === 1 ? 'Player 1' : 'Player 2'}, set your secret number
        </p>
      </div>

      {/* Digit Selection */}
      {step === 1 && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <label style={{ marginRight: '10px' }}>Number of digits:</label>
          <button
            onClick={() => { setDigitsLocal(3); setSecret(''); }}
            style={{
              padding: '8px 16px',
              margin: '0 5px',
              backgroundColor: digits === 3 ? '#007bff' : '#fff',
              color: digits === 3 ? '#fff' : '#000',
              border: '1px solid #007bff',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            3 Digits
          </button>
          <button
            onClick={() => { setDigitsLocal(4); setSecret(''); }}
            style={{
              padding: '8px 16px',
              margin: '0 5px',
              backgroundColor: digits === 4 ? '#007bff' : '#fff',
              color: digits === 4 ? '#fff' : '#000',
              border: '1px solid #007bff',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            4 Digits
          </button>
        </div>
      )}

      {/* Secret Display */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        fontSize: '32px',
        fontWeight: 'bold',
        minHeight: '50px',
        letterSpacing: '10px'
      }}>
        {showSecret ? secret || '____'.slice(0, digits) : '*'.repeat(secret.length) + '_'.repeat(digits - secret.length)}
      </div>

      {/* Show/Hide Toggle */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setShowSecret(!showSecret)}
          style={{
            padding: '5px 15px',
            fontSize: '12px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          {showSecret ? '👁️ Hide' : '👁️ Show'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Number Pad */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '10px',
        marginBottom: '20px'
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(digit => (
          <button
            key={digit}
            onClick={() => handleDigitSelect(digit.toString())}
            disabled={secret.includes(digit.toString()) || secret.length >= digits}
            style={{
              padding: '20px',
              fontSize: '24px',
              fontWeight: 'bold',
              backgroundColor: secret.includes(digit.toString()) ? '#e9ecef' : '#fff',
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              cursor: secret.includes(digit.toString()) || secret.length >= digits ? 'not-allowed' : 'pointer',
              opacity: secret.includes(digit.toString()) || secret.length >= digits ? 0.5 : 1
            }}
          >
            {digit}
          </button>
        ))}
        
        {/* Backspace Button */}
        <button
          onClick={handleBackspace}
          disabled={secret.length === 0}
          style={{
            padding: '20px',
            fontSize: '18px',
            backgroundColor: '#fff',
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            cursor: secret.length === 0 ? 'not-allowed' : 'pointer',
            opacity: secret.length === 0 ? 0.5 : 1
          }}
        >
          ⌫
        </button>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={secret.length !== digits}
          style={{
            gridColumn: 'span 2',
            padding: '20px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: secret.length === digits ? '#28a745' : '#e9ecef',
            color: secret.length === digits ? '#fff' : '#6c757d',
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            cursor: secret.length === digits ? 'pointer' : 'not-allowed'
          }}
        >
          {step === 1 ? 'Next →' : 'Start Game'}
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PassAndPlaySetup;
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
