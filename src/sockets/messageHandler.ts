import { Socket } from 'socket.io';
import { IUser } from '../models/User';
import Message from '../models/Message';
import { logger } from '../utils/logger';
import { onlineUsers } from './index';
import { messageSchema } from '../utils/validators';
import { Types } from 'mongoose';

export const setupMessageHandlers = (socket: Socket, user: IUser): void => {
  // Handle new message
  socket.on('sendMessage', async (data: { receiver: string; content: string }, callback) => {
    try {
      // Validate data
      const validatedData = messageSchema.parse(data);
      
      // Create new message
      const message = await Message.create({
        sender: user._id,
        receiver: validatedData.receiver,
        content: validatedData.content
      });
      
      // Populate message with sender and receiver info
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name email')
        .populate('receiver', 'name email');
      
      // Get receiver's socket id
      const receiverSocketId = onlineUsers.get(validatedData.receiver);
      
      // Send message to receiver if online
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit('newMessage', populatedMessage);
      }
      
      // Send success response
      if (callback) {
        callback({
          success: true,
          data: populatedMessage
        });
      }
    } catch (error: any) {
      logger.error('Send message socket error', error);
      
      if (callback) {
        callback({
          success: false,
          message: 'Error sending message',
          error: error.message
        });
      }
    }
  });
  
  // Handle typing indicator
  socket.on('typing', (data: { receiverId: string }) => {
    try {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit('userTyping', {
          userId: (user._id as Types.ObjectId).toString()
        });
      }
    } catch (error) {
      logger.error('Typing indicator error', error);
    }
  });
  
  // Handle stop typing indicator
  socket.on('stopTyping', (data: { receiverId: string }) => {
    try {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit('userStopTyping', {
          userId: (user._id as Types.ObjectId).toString()
        });
      }
    } catch (error) {
      logger.error('Stop typing indicator error', error);
    }
  });
  
  // Handle read receipt
  socket.on('markAsRead', async (data: { senderId: string }) => {
    try {
      // Update messages as read
      await Message.updateMany(
        {
          sender: data.senderId,
          receiver: user._id,
          read: false
        },
        {
          $set: { read: true }
        }
      );
      
      // Notify sender if online
      const senderSocketId = onlineUsers.get(data.senderId);
      
      if (senderSocketId) {
        socket.to(senderSocketId).emit('messagesRead', {
          userId: (user._id as Types.ObjectId).toString()
        });
      }
    } catch (error) {
      logger.error('Mark as read socket error', error);
    }
  });
};