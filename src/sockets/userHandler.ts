import { Socket } from 'socket.io';
import { IUser } from '../models/User';
import { logger } from '../utils/logger';
import { onlineUsers } from './index';
import { Types } from 'mongoose';

export const setupUserHandlers = (socket: Socket, user: IUser): void => {
  // Handle user join chat room (for one-to-one chat)
  socket.on('joinChat', (data: { userId: string }) => {
    try {
      const chatRoomId = getChatRoomId((user._id as Types.ObjectId).toString(), data.userId);
      
      // Join room
      socket.join(chatRoomId);
      
      logger.debug(`User ${user._id} joined chat room: ${chatRoomId}`);
    } catch (error) {
      logger.error('Join chat error', error);
    }
  });
  
  // Handle user leave chat room
  socket.on('leaveChat', (data: { userId: string }) => {
    try {
      const chatRoomId = getChatRoomId((user._id as Types.ObjectId).toString(), data.userId);
      
      // Leave room
      socket.leave(chatRoomId);
      
      logger.debug(`User ${user._id} left chat room: ${chatRoomId}`);
    } catch (error) {
      logger.error('Leave chat error', error);
    }
  });
  
  // Get online status
  socket.on('getOnlineStatus', (data: { userIds: string[] }, callback) => {
    try {
      // Check which users are online
      const onlineStatus = data.userIds.reduce((acc, userId) => {
        acc[userId] = onlineUsers.has(userId);
        return acc;
      }, {} as Record<string, boolean>);
      
      if (callback) {
        callback({
          success: true,
          data: onlineStatus
        });
      }
    } catch (error) {
      logger.error('Get online status error', error);
      
      if (callback) {
        callback({
          success: false,
          message: 'Error getting online status'
        });
      }
    }
  });
};

// Helper function to generate a consistent chat room ID for two users
const getChatRoomId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('-');
};