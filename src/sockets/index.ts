import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { logger } from '../utils/logger';
import { setupMessageHandlers } from './messageHandler';
import { setupUserHandlers } from './userHandler';
import { Types } from 'mongoose';
// import { setupMessageHandlers } from './messageHandlers';
// import { setupUserHandlers } from './userHandlers';

// Store online users: userId -> socketId
export const onlineUsers = new Map<string, string>();

export let io: Server;

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

  // Middleware for authentication
  io.use(async (socket: Socket, next) => {
    try {
      // Get token from handshake auth
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      (socket as any).user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    try {
      const user = (socket as any).user as IUser;
      
      // Log connection
      logger.info(`User connected: ${user.name} (${user._id})`);
      
      // Add user to online users
      onlineUsers.set((user._id as Types.ObjectId).toString(), socket.id);
      
      // Broadcast user online status
      socket.broadcast.emit('userOnline', {
        userId: (user._id as Types.ObjectId).toString()
      });
      
      // Send online users list to the newly connected user
      socket.emit('onlineUsers', Array.from(onlineUsers.keys()));
      
      // Setup message handlers
      setupMessageHandlers(socket, user);
      
      // Setup user handlers
      setupUserHandlers(socket, user);
      
      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${user.name} (${user._id})`);
        
        // Remove user from online users
        onlineUsers.delete((user._id as Types.ObjectId).toString());
        
        // Broadcast user offline status
        socket.broadcast.emit('userOffline', {
          userId: (user._id as Types.ObjectId).toString()
        });
      });
    } catch (error) {
      logger.error('Socket connection error', error);
    }
  });

  logger.info('Socket.io server initialized');
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};