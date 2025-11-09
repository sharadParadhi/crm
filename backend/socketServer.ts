import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { verifyToken } from './utils/jwt.js';
import { logger } from './utils/logger.js';
import { JWTPayload } from './utils/jwt.js';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
}

let io: SocketServer;

export const setupSocketServer = (httpServer: HttpServer): void => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.io
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token) as JWTPayload;
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      
      next();
    } catch (error: any) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    logger.info(`Socket connected: User ${userId}`);

    // Join user-specific room for notifications
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: User ${userId}`);
    });

    // Handle join lead room for real-time updates
    socket.on('join:lead', (leadId: number) => {
      socket.join(`lead:${leadId}`);
      logger.info(`User ${userId} joined lead room: ${leadId}`);
    });

    // Handle leave lead room
    socket.on('leave:lead', (leadId: number) => {
      socket.leave(`lead:${leadId}`);
      logger.info(`User ${userId} left lead room: ${leadId}`);
    });
  });

  logger.info('Socket.io server initialized');
};

// Export function to emit events
export const emitToUser = (userId: number, event: string, data: any): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToLead = (leadId: number, event: string, data: any): void => {
  if (io) {
    io.to(`lead:${leadId}`).emit(event, data);
  }
};

export const emitToAll = (event: string, data: any): void => {
  if (io) {
    io.emit(event, data);
  }
};
