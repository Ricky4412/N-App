const http = require('http');
const socketIo = require('socket.io');
const winston = require('winston');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'https://app-frontend-chytgaxdm-enricos-projects-bf5d6f99.vercel.app/', 
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

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

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
