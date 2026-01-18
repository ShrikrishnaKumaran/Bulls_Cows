import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useOfflineGameStore from '../store/useOfflineGameStore';
import { validateInput } from '../utils/gameRules';

function PassAndPlaySetup() {
  const navigate = useNavigate();
  const { setPlayer1Secret, setPlayer2Secret, setDigits, startGame } = useOfflineGameStore();
  
  const [digits, setDigitsLocal] = useState(4);
  const [step, setStep] = useState(1);
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
      <h2>Pass & Play Setup</h2>
      <p>{step === 1 ? 'Player 1' : 'Player 2'}, set your secret number</p>

      {step === 1 && (
        <div style={{ marginBottom: '20px' }}>
          <label>Digits: </label>
          <button onClick={() => { setDigitsLocal(3); setSecret(''); }}>3</button>
          <button onClick={() => { setDigitsLocal(4); setSecret(''); }}>4</button>
        </div>
      )}

      <div style={{ fontSize: '24px', marginBottom: '20px' }}>
        {showSecret ? secret || '____'.slice(0, digits) : '*'.repeat(secret.length) + '_'.repeat(digits - secret.length)}
      </div>

      <button onClick={() => setShowSecret(!showSecret)}>
        {showSecret ? 'Hide' : 'Show'}
      </button>

      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '20px 0' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(digit => (
          <button
            key={digit}
            onClick={() => handleDigitSelect(digit.toString())}
            disabled={secret.includes(digit.toString()) || secret.length >= digits}
            style={{ padding: '15px', fontSize: '20px' }}
          >
            {digit}
          </button>
        ))}
        
        <button onClick={handleBackspace} disabled={secret.length === 0} style={{ padding: '15px' }}>
          ⌫
        </button>

        <button
          onClick={handleSubmit}
          disabled={secret.length !== digits}
          style={{ gridColumn: 'span 2', padding: '15px', background: secret.length === digits ? '#28a745' : '#ccc', color: 'white' }}
        >
          {step === 1 ? 'Next' : 'Start Game'}
        </button>
      </div>

      <button onClick={() => navigate('/home')}>Cancel</button>
    </div>
  );
}

export default PassAndPlaySetup;
