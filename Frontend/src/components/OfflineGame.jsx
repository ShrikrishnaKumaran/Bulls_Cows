import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSecretNumber, validateGuess, calculateBullsAndCows, isGameWon, calculateScore } from '../utils/gameLogic';

function OfflineGame() {
  const navigate = useNavigate();
  const [gameConfig, setGameConfig] = useState(null);
  const [gameState, setGameState] = useState('setup'); // setup, player1Turn, player2Turn, roundEnd, gameEnd
  const [currentRound, setCurrentRound] = useState(1);
  
  // Player secrets
  const [player1Secret, setPlayer1Secret] = useState('');
  const [player2Secret, setPlayer2Secret] = useState('');
  const [tempSecret, setTempSecret] = useState('');
  const [settingSecretFor, setSettingSecretFor] = useState('player1');
  
  // Game history
  const [player1Guesses, setPlayer1Guesses] = useState([]);
  const [player2Guesses, setPlayer2Guesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  
  // Scores
  const [player1Wins, setPlayer1Wins] = useState(0);
  const [player2Wins, setPlayer2Wins] = useState(0);
  const [roundWinner, setRoundWinner] = useState(null);
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    const config = localStorage.getItem('offlineGameConfig');
    if (!config) {
      navigate('/setup/local');
      return;
    }
    setGameConfig(JSON.parse(config));
    setMessage('Player 1: Set your secret number');
  }, [navigate]);

  if (!gameConfig) return <div>Loading...</div>;

  const currentPlayer = gameState === 'player1Turn' ? gameConfig.player1 : gameConfig.player2;
  const otherPlayer = gameState === 'player1Turn' ? gameConfig.player2 : gameConfig.player1;

  const handleSetSecret = () => {
    const validation = validateGuess(tempSecret, gameConfig.difficulty);
    if (!validation.valid) {
      setMessage(validation.message);
      return;
    }

    if (settingSecretFor === 'player1') {
      setPlayer1Secret(tempSecret);
      setTempSecret('');
      setSettingSecretFor('player2');
      setMessage(`Player 2: Set your secret number`);
    } else {
      setPlayer2Secret(tempSecret);
      setTempSecret('');
      setGameState('player1Turn');
      setMessage(`${gameConfig.player1}'s turn to guess!`);
    }
  };

  const handleGuess = () => {
    const validation = validateGuess(currentGuess, gameConfig.difficulty);
    if (!validation.valid) {
      setMessage(validation.message);
      return;
    }

    const isPlayer1 = gameState === 'player1Turn';
    const secret = isPlayer1 ? player2Secret : player1Secret;
    const result = calculateBullsAndCows(secret, currentGuess);
    
    const guessData = {
      guess: currentGuess,
      bulls: result.bulls,
      cows: result.cows,
      attempt: isPlayer1 ? player1Guesses.length + 1 : player2Guesses.length + 1
    };

    if (isPlayer1) {
      const newGuesses = [...player1Guesses, guessData];
      setPlayer1Guesses(newGuesses);
      
      if (isGameWon(result.bulls, gameConfig.difficulty)) {
        handleRoundWin(gameConfig.player1, newGuesses.length);
        return;
      }
    } else {
      const newGuesses = [...player2Guesses, guessData];
      setPlayer2Guesses(newGuesses);
      
      if (isGameWon(result.bulls, gameConfig.difficulty)) {
        handleRoundWin(gameConfig.player2, newGuesses.length);
        return;
      }
    }

    setCurrentGuess('');
    setGameState(isPlayer1 ? 'player2Turn' : 'player1Turn');
    setMessage(`${otherPlayer}'s turn to guess!`);
  };

  const handleRoundWin = (winner, attempts) => {
    setRoundWinner(winner);
    const score = calculateScore(attempts, gameConfig.difficulty);
    
    if (winner === gameConfig.player1) {
      setPlayer1Wins(player1Wins + 1);
    } else {
      setPlayer2Wins(player2Wins + 1);
    }
    
    setGameState('roundEnd');
    setMessage(`${winner} won the round in ${attempts} attempts! (Score: ${score})`);
  };

  const handleNextRound = () => {
    const maxRounds = gameConfig.format === 'bestOf1' ? 1 : gameConfig.format === 'bestOf3' ? 3 : 5;
    const requiredWins = Math.ceil(maxRounds / 2);
    
    if (player1Wins >= requiredWins || player2Wins >= requiredWins) {
      setGameState('gameEnd');
      const gameWinner = player1Wins > player2Wins ? gameConfig.player1 : gameConfig.player2;
      setMessage(`🏆 ${gameWinner} wins the game! ${player1Wins}-${player2Wins}`);
      return;
    }
    
    setPlayer1Secret('');
    setPlayer2Secret('');
    setPlayer1Guesses([]);
    setPlayer2Guesses([]);
    setCurrentGuess('');
    setTempSecret('');
    setSettingSecretFor('player1');
    setRoundWinner(null);
    setCurrentRound(currentRound + 1);
    setGameState('setup');
    setMessage('Player 1: Set your secret number for next round');
  };

  const handleNewGame = () => {
    navigate('/setup/local');
  };

  if (gameState === 'setup') {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center' }}>Round {currentRound}</h2>
        <div style={{ padding: '30px', border: '2px solid #4CAF50', borderRadius: '10px', textAlign: 'center' }}>
          <h3>{message}</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Enter a {gameConfig.difficulty}-digit number with unique digits
          </p>
          <input
            type="password"
            value={tempSecret}
            onChange={(e) => setTempSecret(e.target.value)}
            maxLength={gameConfig.difficulty}
            placeholder="••••"
            style={{
              width: '200px',
              padding: '15px',
              fontSize: '24px',
              textAlign: 'center',
              border: '2px solid #ccc',
              borderRadius: '5px',
              marginBottom: '20px',
              letterSpacing: '10px'
            }}
          />
          <br />
          <button
            onClick={handleSetSecret}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '5px',
              background: '#4CAF50',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            Confirm Secret
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'roundEnd' || gameState === 'gameEnd') {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>{gameState === 'gameEnd' ? '🏆 Game Over!' : '🎯 Round Complete!'}</h1>
          <h2>{message}</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '30px 0', padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
            <div>
              <h3>{gameConfig.player1}</h3>
              <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{player1Wins}</p>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>-</div>
            <div>
              <h3>{gameConfig.player2}</h3>
              <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{player2Wins}</p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p><strong>Secrets:</strong></p>
            <p>{gameConfig.player1}: {player1Secret} | {gameConfig.player2}: {player2Secret}</p>
          </div>

          {gameState === 'roundEnd' ? (
            <button
              onClick={handleNextRound}
              style={{
                padding: '15px 40px',
                fontSize: '18px',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '5px',
                background: '#4CAF50',
                color: 'white',
                fontWeight: 'bold',
                marginRight: '10px'
              }}
            >
              Next Round
            </button>
          ) : (
            <button
              onClick={handleNewGame}
              style={{
                padding: '15px 40px',
                fontSize: '18px',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '5px',
                background: '#2196F3',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              New Game
            </button>
          )}
          
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '5px',
              background: 'white',
              marginLeft: '10px'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Active gameplay
  const currentPlayerGuesses = gameState === 'player1Turn' ? player1Guesses : player2Guesses;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3>Round {currentRound}</h3>
          <p>Score: {gameConfig.player1} {player1Wins} - {player2Wins} {gameConfig.player2}</p>
        </div>
        <button 
          onClick={() => navigate('/home')}
          style={{ 
            padding: '8px 16px', 
            cursor: 'pointer',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        >
          Quit Game
        </button>
      </div>

      <div style={{ padding: '20px', background: '#e3f2fd', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
        <h2>{currentPlayer}'s Turn</h2>
        <p style={{ color: '#666' }}>{message}</p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <input
            type="text"
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value)}
            maxLength={gameConfig.difficulty}
            placeholder={`Enter ${gameConfig.difficulty} digits`}
            style={{
              width: '250px',
              padding: '15px',
              fontSize: '24px',
              textAlign: 'center',
              border: '2px solid #2196F3',
              borderRadius: '5px',
              marginRight: '10px',
              letterSpacing: '5px'
            }}
          />
          <button
            onClick={handleGuess}
            style={{
              padding: '15px 40px',
              fontSize: '20px',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '5px',
              background: '#4CAF50',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            Guess
          </button>
        </div>
      </div>

      <div style={{ border: '1px solid #ccc', borderRadius: '10px', padding: '20px' }}>
        <h3>Guess History ({currentPlayerGuesses.length} attempts)</h3>
        {currentPlayerGuesses.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center' }}>No guesses yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Guess</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>🐂 Bulls</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>🐄 Cows</th>
              </tr>
            </thead>
            <tbody>
              {[...currentPlayerGuesses].reverse().map((g, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{g.attempt}</td>
                  <td style={{ padding: '10px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', letterSpacing: '5px' }}>
                    {g.guess}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontSize: '18px', color: '#4CAF50' }}>
                    {g.bulls}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontSize: '18px', color: '#FF9800' }}>
                    {g.cows}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OfflineGame;
