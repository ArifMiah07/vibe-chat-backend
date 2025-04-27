import { Request, Response } from 'express';
import User from '../models/User';
import { logger } from '../utils/logger';

// @desc    Get all users (excluding current user)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all users except the current user
    const users = await User.find({ _id: { $ne: req.user?._id } })
      .select('name email');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    logger.error('Get users error', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user by ID error', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};