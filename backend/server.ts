import http from 'http';
import app from './app.js';
import { logger } from './utils/logger.js';
import { setupSocketServer } from './socketServer.js';
import { prisma } from './prismaClient.js';

const PORT = process.env.PORT || 5000;

// Verify database connection before starting server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connection verified');

    const server = http.createServer(app);

    // Setup Socket.io
    setupSocketServer(server);

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Log database connection status
      if (process.env.DATABASE_URL) {
        const dbUrl = process.env.DATABASE_URL;
        const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
        if (isLocalhost && process.env.NODE_ENV === 'production') {
          logger.warn('WARNING: DATABASE_URL appears to point to localhost in production!');
          logger.warn('This will not work on Render. Please use the Internal Database URL from Render.');
        }
      } else {
        logger.error('ERROR: DATABASE_URL environment variable is not set!');
        logger.error('Please set DATABASE_URL in your Render environment variables.');
      }
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('HTTP server closed');
        prisma.$disconnect().then(() => {
          logger.info('Database connection closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('HTTP server closed');
        prisma.$disconnect().then(() => {
          logger.info('Database connection closed');
          process.exit(0);
        });
      });
    });
  } catch (error: any) {
    logger.error('Failed to start server:', error.message);
    logger.error('Please check your DATABASE_URL environment variable.');
    process.exit(1);
  }
}

startServer();