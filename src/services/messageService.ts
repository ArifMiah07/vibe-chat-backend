// src/services/messageService.ts

import Message, { IMessage } from '../models/Message';
import User from '../models/User';
import { MessageInput } from '../utils/validators';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export class MessageService {
  /**
   * Get messages between two users
   * @param currentUserId ID of the current user
   * @param otherUserId ID of the other user
   * @returns Array of messages
   */
  static async getMessagesBetweenUsers(
    currentUserId: string, 
    otherUserId: string
  ): Promise<IMessage[]> {
    try {
      // Validate user IDs
      if (!mongoose.Types.ObjectId.isValid(currentUserId) || 
          !mongoose.Types.ObjectId.isValid(otherUserId)) {
        throw new Error('Invalid user ID');
      }
      
      // Check if the other user exists
      const otherUser = await User.findById(otherUserId);
      if (!otherUser) {
        throw new Error('User not found');
      }
      
      // Get messages
      const messages = await Message.find({
        $or: [
          { sender: currentUserId, receiver: otherUserId },
          { sender: otherUserId, receiver: currentUserId }
        ]
      })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email')
      .populate('receiver', 'name email');
      
      return messages;
    } catch (error) {
      logger.error('Get messages error', error);
      throw error;
    }
  }
  
  /**
   * Create a new message
   * @param senderId ID of the message sender
   * @param messageData Message data
   * @returns Newly created message
   */
  static async createMessage(
    senderId: string, 
    messageData: MessageInput
  ): Promise<IMessage> {
    try {
      // Validate receiver ID
      if (!mongoose.Types.ObjectId.isValid(messageData.receiver)) {
        throw new Error('Invalid receiver ID');
      }
      
      // Check if receiver exists
      const receiver = await User.findById(messageData.receiver);
      if (!receiver) {
        throw new Error('Receiver not found');
      }
      
      // Create message
      const message = await Message.create({
        sender: senderId,
        receiver: messageData.receiver,
        content: messageData.content
      });
      
      // Populate sender and receiver for response
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name email')
        .populate('receiver', 'name email');
      
      if (!populatedMessage) {
        throw new Error('Error retrieving created message');
      }
      
      return populatedMessage;
    } catch (error) {
      logger.error('Create message error', error);
      throw error;
    }
  }
  
  /**
   * Mark messages as read
   * @param senderId ID of the message sender
   * @param receiverId ID of the message receiver
   * @returns Number of messages marked as read
   */
  static async markMessagesAsRead(
    senderId: string, 
    receiverId: string
  ): Promise<number> {
    try {
      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(senderId) || 
          !mongoose.Types.ObjectId.isValid(receiverId)) {
        throw new Error('Invalid user ID');
      }
      
      // Update messages
      const result = await Message.updateMany(
        {
          sender: senderId,
          receiver: receiverId,
          read: false
        },
        {
          $set: { read: true }
        }
      );
      
      return result.modifiedCount;
    } catch (error) {
      logger.error('Mark messages as read error', error);
      throw error;
    }
  }
}