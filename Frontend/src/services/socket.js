import { io } from 'socket.io-client';

// In production: Use VITE_SOCKET_URL env var
// In development: Use '' (empty) for same-origin via Vite proxy
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

let socket = null;

export const initializeSocket = (token) => {
  if (socket && socket.connected) {
    console.log('[Socket] Already connected:', socket.id);
    return socket;
  }

  // If socket exists but disconnected, destroy and recreate
  if (socket) {
    console.log('[Socket] Destroying stale socket');
    socket.disconnect();
    socket = null;
  }

  console.log('[Socket] Initializing new socket connection to:', SOCKET_URL || 'same-origin');

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity, // Keep trying to reconnect
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 30000, // Increased timeout for Render cold starts
    transports: ['websocket', 'polling'], // Try websocket first, fall back to polling
    forceNew: false,
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

  socket.on('reconnect', (attemptNumber) => {
    console.log('[Socket] Reconnected after', attemptNumber, 'attempts. New ID:', socket.id);
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('[Socket] Reconnect attempt', attemptNumber);
  });

  // Debug: Log all incoming events
  socket.onAny((event, ...args) => {
    console.log('[Socket] Received event:', event, args);
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
