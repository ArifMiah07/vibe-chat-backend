import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { logger } from '../utils/logger';

export let io: Server;

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const setupSocketIO = (httpServer: HttpServer): void => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? 'https://your-frontend-domain.com'
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  logger.info('Socket.io server initialized');
};