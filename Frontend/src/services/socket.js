import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    autoConnect: false,
  });

  socket.on('connect', () => {
    // Connected
  });

  socket.on('disconnect', () => {
    // Disconnected
  });

  socket.on('connect_error', (error) => {
    // Handle error silently or use proper error handling
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
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

export default {
  initializeSocket,
  getSocket,
  connectSocket,
  disconnectSocket,
  destroySocket,
};
