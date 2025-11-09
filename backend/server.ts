import http from 'http';
import app from './app.js';
import { logger } from './utils/logger.js';
import { setupSocketServer } from './socketServer.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Setup Socket.io
setupSocketServer(server);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});