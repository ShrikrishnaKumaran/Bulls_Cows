import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';

/**
 * JoinRoom - Join an existing game room by code
 * Room codes are 4 alphanumeric characters (e.g., "A1B2")
 */
const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (!roomCode || roomCode.length !== 4) {
      setError('Please enter a valid 4-character room code');
      return;
    }

    if (!socket) {
      setError('Socket connection not available');
      return;
    }

    setLoading(true);
    setError('');

    socket.emit('join-room', roomCode.toUpperCase(), (response) => {
      setLoading(false);
      if (response.success) {
        navigate(`/lobby/room/${roomCode.toUpperCase()}`);
      } else {
        setError(response.message);
      }
    });
  };

  return (
    <div className="join-room">
      <h2>Join Room</h2>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        placeholder="Enter Room Code (4 chars)"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        maxLength={4}
      />
      <button onClick={handleJoinRoom} disabled={loading || !roomCode}>
        {loading ? 'Joining...' : 'Join Room'}
      </button>
    </div>
  );
};

export default JoinRoom;
