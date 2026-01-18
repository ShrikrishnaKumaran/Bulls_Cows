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
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2>🎉 {winner === 'PLAYER_1' ? 'Player 1' : 'Player 2'} Wins!</h2>
        <p>Player 1: {player1Guesses.length} attempts</p>
        <p>Player 2: {player2Guesses.length} attempts</p>
        <button onClick={handlePlayAgain} style={{ padding: '10px 20px', margin: '5px' }}>Play Again</button>
        <button onClick={handleQuit} style={{ padding: '10px 20px', margin: '5px' }}>Quit</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Pass & Play</h2>
      <h3>{turn === 'PLAYER_1' ? 'Player 1' : 'Player 2'}'s Turn</h3>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div style={{ fontSize: '32px', margin: '20px 0' }}>
        {currentGuess || '_'.repeat(digits)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '300px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(digit => (
          <button
            key={digit}
            onClick={() => handleDigitClick(digit.toString())}
            disabled={currentGuess.includes(digit.toString()) || currentGuess.length >= digits}
            style={{ padding: '15px', fontSize: '20px' }}
          >
            {digit}
          </button>
        ))}
        
        <button onClick={handleBackspace} disabled={currentGuess.length === 0} style={{ padding: '15px' }}>
          ⌫
        </button>

        <button
          onClick={handleSubmitGuess}
          disabled={currentGuess.length !== digits}
          style={{ gridColumn: 'span 2', padding: '15px', background: currentGuess.length === digits ? '#007bff' : '#ccc', color: 'white' }}
        >
          Submit
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        <div style={{ flex: 1 }}>
          <h4>Player 1</h4>
          {player1Guesses.length === 0 ? <p>No guesses</p> : (
            player1Guesses.map((g, i) => (
              <div key={i} style={{ padding: '5px', background: '#f5f5f5', margin: '5px 0' }}>
                {g.guess} - 🐂{g.bulls} 🐄{g.cows} 💩{g.shit}
              </div>
            ))
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h4>Player 2</h4>
          {player2Guesses.length === 0 ? <p>No guesses</p> : (
            player2Guesses.map((g, i) => (
              <div key={i} style={{ padding: '5px', background: '#f5f5f5', margin: '5px 0' }}>
                {g.guess} - 🐂{g.bulls} 🐄{g.cows} 💩{g.shit}
              </div>
            ))
          )}
        </div>
      </div>

      <button onClick={handleQuit} style={{ marginTop: '20px', padding: '10px 20px' }}>Quit</button>
    </div>
  );
}

export default OfflineGame;
