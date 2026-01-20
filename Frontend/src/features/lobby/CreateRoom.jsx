import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';

const CreateRoom = () => {
  const [settings, setSettings] = useState({
    format: 3,
    digits: 4,
    difficulty: 'easy',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!socket) {
      setError('Socket connection not available');
      return;
    }

    setLoading(true);
    setError('');

    socket.emit('create-room', settings, (response) => {
      setLoading(false);
      if (response.success) {
        navigate(`/lobby/${response.room.roomCode}`);
      } else {
        setError(response.message);
      }
    });
  };

  return (
    <div className="create-room">
      <h2>Create Room</h2>
      {error && <div className="error">{error}</div>}
      <div className="settings">

        <label>
          Format (Best of):
          <select
            value={settings.format}
            onChange={(e) =>
              setSettings({ ...settings, format: Number(e.target.value) })
            }
          >
            <option value={1}>1</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </label>
        <label>
          Number of Digits:
          <select
            value={settings.digits}
            onChange={(e) =>
              setSettings({ ...settings, digits: Number(e.target.value) })
            }
          >
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </label>
        <label>
          Difficulty:
          <select
            value={settings.difficulty}
            onChange={(e) =>
              setSettings({ ...settings, difficulty: e.target.value })
            }
          >
            <option value="easy">Easy</option>
            <option value="hard">Hard</option>
          </select>
        </label>
      </div>
      <button onClick={handleCreateRoom} disabled={loading}>
        {loading ? 'Creating...' : 'Create Room'}
      </button>
    </div>
  );
};

export default CreateRoom;
