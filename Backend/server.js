require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');
const { initializeSocket } = require('./sockets/socketManager');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
