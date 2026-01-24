/**
 * RoomWaiting - Waiting room before game starts
 * 
 * Shows room info and waits for opponent to join.
 * When opponent joins, automatically navigates to game.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import useGameStore from '../../store/useGameStore';

const RoomWaiting = () => {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { socket } = useSocket();
  const navigate = useNavigate();
  const initializeGame = useGameStore((state) => state.initializeGame);

  useEffect(() => {
    if (!socket || !roomCode) return;

    // Join the socket room first
    socket.emit('join-room', roomCode, (response) => {
      setLoading(false);
      if (response.success) {
        setRoom(response.room);
      } else {
        // If join fails (maybe already joined or room full), try to just get info
        socket.emit('get-room', roomCode, (getResponse) => {
          if (getResponse.success) {
            setRoom(getResponse.room);
          } else {
            setError(getResponse.message || response.message);
          }
        });
      }
    });

    // Listen for player joined (opponent joined)
    socket.on('player-joined', (data) => {
      setRoom((prev) => ({
        ...prev,
        opponent: data.opponent,
      }));
    });

    // Listen for player left
    socket.on('player-left', () => {
      setRoom((prev) => ({
        ...prev,
        opponent: null,
      }));
    });

    // Listen for game start - initialize game store and navigate
    socket.on('game-start', (data) => {
      // Initialize game store with game data
      initializeGame(data.roomCode, {
        format: data.format,
        digits: data.digits,
        hostId: data.host?._id || data.host,
        opponentId: data.opponent?._id || data.opponent,
        roundNumber: 1,
        scores: {},
      });
      
      // Navigate to the online game
      navigate(`/game/online/${data.roomCode}`);
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-start');
    };
  }, [socket, roomCode, navigate, initializeGame]);

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
        <p>Host: {room.host?.username || 'Unknown'}</p>
        <p>Players: {room.opponent ? '2' : '1'} / 2</p>
        <p>Format: Best of {room.format}</p>
        <p>Digits: {room.digits}</p>
        <p>Difficulty: {room.difficulty}</p>
        <p>Status: {room.status}</p>
      </div>
      <div className="players-list">
        <h3>Players:</h3>
        <ul>
          <li>{room.host?.username || 'Host'} (Host)</li>
          {room.opponent && <li>{room.opponent.username} (Opponent)</li>}
        </ul>
      </div>
      {!room.opponent && (
        <p className="waiting-text">Waiting for opponent to join...</p>
      )}
      <button onClick={handleLeaveRoom}>Leave Room</button>
    </div>
  );
};

export default RoomWaiting;
