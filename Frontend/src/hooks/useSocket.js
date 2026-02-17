import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket, initializeSocket, connectSocket, isSocketConnected } from '../services/socket';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuthStore();
  const warmupDone = useRef(false);

  // Wake up the server if it's sleeping (Render cold start)
  useEffect(() => {
    if (!warmupDone.current && isAuthenticated) {
      warmupDone.current = true;
      // Ping health endpoint to warm up server
      api.get('/health').catch(() => {
        // Ignore errors, just trying to wake up server
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    try {
      // Initialize socket with token
      const socketInstance = initializeSocket(token);
      setSocket(socketInstance);

      // Check if already connected
      if (socketInstance.connected) {
        setConnected(true);
      } else {
        // Connect if not connected
        connectSocket();
      }

      // Listen for connection events
      const onConnect = () => {
        setConnected(true);
        setError(null);
      };

      const onDisconnect = (reason) => {
        setConnected(false);
      };

      const onConnectError = (err) => {
        console.error('[useSocket] Connection error:', err.message);
        setError(err.message);
        setConnected(false);
        
        // If authentication error, the token might be expired
        // Trigger a page reload or redirect to login
        if (err.message.includes('Authentication error') || err.message.includes('Invalid token')) {
          console.warn('[useSocket] Token might be expired. Please re-login.');
          // Clear invalid token
          localStorage.removeItem('token');
          // Optionally redirect to login
          window.location.href = '/auth';
        }
      };

      socketInstance.on('connect', onConnect);
      socketInstance.on('disconnect', onDisconnect);
      socketInstance.on('connect_error', onConnectError);

      return () => {
        socketInstance.off('connect', onConnect);
        socketInstance.off('disconnect', onDisconnect);
        socketInstance.off('connect_error', onConnectError);
      };
    } catch (err) {
      console.error('[useSocket] Initialization error:', err);
      setError(err.message);
    }
  }, [isAuthenticated, token]);

  // Force reconnect function
  const reconnect = useCallback(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  return { socket, connected, error, reconnect };
};

export default useSocket;
