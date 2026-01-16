import { useState } from 'react';
import useGameStore from '../../store/useGameStore';

const GameBoard = () => {
  const [guess, setGuess] = useState('');
  const { match, guessHistory, makeGuess } = useGameStore();

  const handleGuessChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setGuess(value);
    }
  };

  const handleSubmitGuess = async () => {
    if (guess.length !== 4) {
      alert('Please enter a 4-digit number');
      return;
    }

    // Check for unique digits
    if (new Set(guess).size !== 4) {
      alert('All digits must be unique');
      return;
    }

    try {
      await makeGuess(guess);
      setGuess('');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="game-board">
      <h2>Bulls and Cows</h2>
      
      <div className="guess-input">
        <input
          type="text"
          value={guess}
          onChange={handleGuessChange}
          placeholder="Enter 4 digits"
          maxLength={4}
        />
        <button onClick={handleSubmitGuess} disabled={guess.length !== 4}>
          Submit Guess
        </button>
      </div>

      <div className="guess-history">
        <h3>Guess History</h3>
        {guessHistory.length === 0 ? (
          <p>No guesses yet</p>
        ) : (
          <ul>
            {guessHistory.map((item, index) => (
              <li key={index}>
                <span className="guess">{item.guess}</span>
                <span className="bulls">Bulls: {item.bulls}</span>
                <span className="cows">Cows: {item.cows}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
