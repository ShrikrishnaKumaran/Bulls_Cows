import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';

const RoomWaiting = () => {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !roomCode) return;

    // Get room info
    socket.emit('get-room', roomCode, (response) => {
      setLoading(false);
      if (response.success) {
        setRoom(response.room);
      } else {
        setError(response.message);
      }
    });

    // Listen for player joined
    socket.on('player-joined', (data) => {
      setRoom((prev) => ({
        ...prev,
        players: data.players,
        playerCount: data.playerCount,
      }));
    });

    // Listen for player left
    socket.on('player-left', (data) => {
      setRoom((prev) => ({
        ...prev,
        players: data.players,
        playerCount: data.playerCount,
      }));
    });

    // Listen for game start
    socket.on('game-start', (data) => {
      navigate(`/game/${data.roomCode}`);
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-start');
    };
  }, [socket, roomCode, navigate]);

  const handleLeaveRoom = () => {
    if (socket && roomCode) {
      socket.emit('leave-room', roomCode, (response) => {
        if (response.success) {
          navigate('/');
        }
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!room) return <div>Room not found</div>;

  return (
    <div className="room-waiting">
      <h2>Room: {roomCode}</h2>
      <div className="room-info">
        <p>Host: {room.host.username}</p>
        <p>Mode: {room.mode}</p>
        <p>Players: {room.playerCount} / 2</p>
        <p>Format: Best of {room.format}</p>
        <p>Digits: {room.digits}</p>
        <p>Difficulty: {room.difficulty}</p>
        <p>Status: {room.status}</p>
      </div>
      <div className="players-list">
        <h3>Players:</h3>
        <ul>
          {room.players.map((player) => (
            <li key={player._id}>{player.username}</li>
          ))}
        </ul>
      </div>
      <button onClick={handleLeaveRoom}>Leave Room</button>
    </div>
  );
};

export default RoomWaiting;
