const http = require('http');
const socketIo = require('socket.io');
const winston = require('winston');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Handle new client connections
io.on('connection', (socket) => {
  logger.info('New client connected');

  socket.on('sendMessage', (message) => {
    io.emit('receiveMessage', message);
    logger.info('Message sent', { message });
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });

  socket.on('error', (err) => {
    logger.error('Socket error', { err });
  });
});

// Start the server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Error handling for server listening
server.on('error', (err) => {
  logger.error('Server error', { err });
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Closed out remaining connections.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
