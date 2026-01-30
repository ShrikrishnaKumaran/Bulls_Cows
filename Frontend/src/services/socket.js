import { io } from 'socket.io-client';

// Production backend URL (fallback when env vars not set)
const PROD_BACKEND_URL = 'https://bulls-cows-backend.onrender.com';

// In production: Use VITE_SOCKET_URL or fallback to production URL
// In development: Use '' (empty) for same-origin
const isProd = import.meta.env.PROD;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (isProd ? PROD_BACKEND_URL : '');

let socket = null;

export const initializeSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  // If socket exists but disconnected, destroy and recreate
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000, // Increased timeout for Render cold starts
    transports: ['websocket', 'polling'], // Try websocket first, fall back to polling
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    // Try to get token from localStorage and initialize
    const token = localStorage.getItem('token');
    if (token) {
      return initializeSocket(token);
    }
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const destroySocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Check if socket is connected
export const isSocketConnected = () => {
  return socket && socket.connected;
};

// Alias for useOnlineGameStore compatibility
export const initSocket = initializeSocket;

export default {
  initializeSocket,
  initSocket,
  getSocket,
  connectSocket,
  disconnectSocket,
  destroySocket,
  isSocketConnected,
};
