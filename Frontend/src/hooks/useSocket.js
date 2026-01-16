import { useEffect, useState } from 'react';
import { getSocket, connectSocket } from '../services/socket';
import useAuthStore from '../store/useAuthStore';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    try {
      const socketInstance = getSocket();
      setSocket(socketInstance);

      // Connect socket
      connectSocket();

      // Listen for connection events
      socketInstance.on('connect', () => {
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setConnected(false);
      });

      return () => {
        socketInstance.off('connect');
        socketInstance.off('disconnect');
      };
    } catch (error) {
      console.error('Socket hook error:', error);
    }
  }, [isAuthenticated, token]);

  return { socket, connected };
};

export default useSocket;
