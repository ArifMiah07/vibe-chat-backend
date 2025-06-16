// src/controllers/messageController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message';
import User from '../models/User';
import { logger } from '../utils/logger';
import { messageSchema } from '../utils/validators';
import { getIO } from '../config/socket';

// @desc    Get messages between current user and another user
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    
    // Validate userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
      return;
    }
    
    // Check if the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Get messages
    const messages = await Message.find({
      $or: [
        { sender: req.user?._id, receiver: userId },
        { sender: userId, receiver: req.user?._id }
      ]
    }).sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    logger.error('Get messages error', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = messageSchema.parse(req.body);
    
    const receiverId = validatedData.receiver;
    
    // Validate receiverId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid receiver ID'
      });
      return;
    }
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
      return;
    }
    
    // Create message
    const message = await Message.create({
      sender: req.user?._id,
      receiver: receiverId,
      content: validatedData.content
    });
    
    // Populate sender info for socket event
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');
    
    // Safely emit socket event (check if Socket.io is initialized)
    try {
      const io = getIO();
      io.to(receiverId).emit('newMessage', populatedMessage);
    } catch (socketError) {
      // Log but don't fail the request if Socket.io isn't ready
      logger.warn('Socket.io not available for real-time notification', socketError);
    }
    
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error: any) {
    logger.error('Send message error', error);
    
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    
    // Validate userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
      return;
    }
    
    // Update message read status
    const result = await Message.updateMany(
      {
        sender: userId,
        receiver: req.user?._id,
        read: false
      },
      {
        $set: { read: true }
      }
    );
    
    res.status(200).json({
      success: true,
      count: result.modifiedCount,
      message: `Marked ${result.modifiedCount} messages as read`
    });
  } catch (error) {
    logger.error('Mark as read error', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};