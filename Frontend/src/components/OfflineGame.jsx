import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useOfflineGameStore from '../store/useOfflineGameStore';

function OfflineGame() {
  const navigate = useNavigate();
  const {
    gamePhase,
    turn,
    digits,
    player1Guesses,
    player2Guesses,
    winner,
    submitGuess,
    resetGame,
    playAgain
  } = useOfflineGameStore();

  const [currentGuess, setCurrentGuess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (gamePhase !== 'PLAYING' && gamePhase !== 'GAME_OVER') {
      navigate('/offline/setup');
    }
  }, [gamePhase, navigate]);

  const handleDigitClick = (digit) => {
    if (currentGuess.length < digits && !currentGuess.includes(digit)) {
      setCurrentGuess(currentGuess + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setCurrentGuess(currentGuess.slice(0, -1));
    setError('');
  };

  const handleSubmitGuess = () => {
    if (currentGuess.length !== digits) {
      setError(`Please enter exactly ${digits} digits`);
      return;
    }

    const result = submitGuess(currentGuess);
    
    if (!result.success) {
      setError(result.error);
      return;
    }

    setCurrentGuess('');
    setError('');
  };

  const handlePlayAgain = () => {
    playAgain();
    navigate('/offline/setup');
  };

  const handleQuit = () => {
    resetGame();
    navigate('/home');
  };

  if (gamePhase === 'GAME_OVER') {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          🎉 {winner === 'PLAYER_1' ? 'Player 1' : 'Player 2'} Wins! 🎉
        </h1>
        
        <div style={{ marginBottom: '30px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <div style={{ flex: 1, padding: '20px', border: '2px solid #007bff', borderRadius: '10px' }}>
            <h3>Player 1</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {player1Guesses.length} attempts
            </p>
          </div>
          <div style={{ flex: 1, padding: '20px', border: '2px solid #28a745', borderRadius: '10px' }}>
            <h3>Player 2</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {player2Guesses.length} attempts
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={handlePlayAgain}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Play Again
          </button>
          <button
            onClick={handleQuit}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Quit to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Bulls, Cows & Shit</h1>
        <h2 style={{ 
          color: turn === 'PLAYER_1' ? '#007bff' : '#28a745',
          fontSize: '24px' 
        }}>
          {turn === 'PLAYER_1' ? 'Player 1' : 'Player 2'}'s Turn
        </h2>
      </div>

      {/* Current Guess Input */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px'
      }}>
        <div style={{ 
          fontSize: '48px',
          fontWeight: 'bold',
          letterSpacing: '15px',
          marginBottom: '15px',
          minHeight: '60px'
        }}>
          {currentGuess || '_'.repeat(digits)}
        </div>

        {error && (
          <div style={{ 
            padding: '10px', 
            marginTop: '10px',
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        {/* Number Pad */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '10px',
          maxWidth: '300px',
          margin: '20px auto'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(digit => (
            <button
              key={digit}
              onClick={() => handleDigitClick(digit.toString())}
              disabled={currentGuess.includes(digit.toString()) || currentGuess.length >= digits}
              style={{
                padding: '15px',
                fontSize: '20px',
                fontWeight: 'bold',
                backgroundColor: currentGuess.includes(digit.toString()) ? '#e9ecef' : '#fff',
                border: '2px solid #dee2e6',
                borderRadius: '8px',
                cursor: currentGuess.includes(digit.toString()) || currentGuess.length >= digits ? 'not-allowed' : 'pointer',
                opacity: currentGuess.includes(digit.toString()) || currentGuess.length >= digits ? 0.5 : 1
              }}
            >
              {digit}
            </button>
          ))}
          
          <button
            onClick={handleBackspace}
            disabled={currentGuess.length === 0}
            style={{
              padding: '15px',
              fontSize: '18px',
              backgroundColor: '#fff',
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              cursor: currentGuess.length === 0 ? 'not-allowed' : 'pointer',
              opacity: currentGuess.length === 0 ? 0.5 : 1
            }}
          >
            ⌫
          </button>

          <button
            onClick={handleSubmitGuess}
            disabled={currentGuess.length !== digits}
            style={{
              gridColumn: 'span 2',
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: currentGuess.length === digits ? '#007bff' : '#e9ecef',
              color: currentGuess.length === digits ? '#fff' : '#6c757d',
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              cursor: currentGuess.length === digits ? 'pointer' : 'not-allowed'
            }}
          >
            Submit
          </button>
        </div>
      </div>

      {/* History - Two Columns */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Player 1 History */}
        <div style={{ flex: 1 }}>
          <h3 style={{ textAlign: 'center', color: '#007bff' }}>Player 1</h3>
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '10px'
          }}>
            {player1Guesses.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999' }}>No guesses yet</p>
            ) : (
              player1Guesses.map((guess, index) => (
                <div key={index} style={{ 
                  padding: '10px', 
                  marginBottom: '5px', 
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{guess.guess}</span>
                  <span style={{ fontSize: '14px' }}>
                    🐂 {guess.bulls} | 🐄 {guess.cows} | 💩 {guess.shit}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Player 2 History */}
        <div style={{ flex: 1 }}>
          <h3 style={{ textAlign: 'center', color: '#28a745' }}>Player 2</h3>
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '2px solid #28a745',
            borderRadius: '8px',
            padding: '10px'
          }}>
            {player2Guesses.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999' }}>No guesses yet</p>
            ) : (
              player2Guesses.map((guess, index) => (
                <div key={index} style={{ 
                  padding: '10px', 
                  marginBottom: '5px', 
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{guess.guess}</span>
                  <span style={{ fontSize: '14px' }}>
                    🐂 {guess.bulls} | 🐄 {guess.cows} | 💩 {guess.shit}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleQuit}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Quit Game
        </button>
      </div>
    </div>
  );
}

export default OfflineGame;
