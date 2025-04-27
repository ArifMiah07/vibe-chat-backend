import User, { IUser } from '../models/User';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export class UserService {
  /**
   * Get all users except the current user
   * @param currentUserId ID of the current user
   * @returns Array of users
   */
  static async getAllUsers(currentUserId: string): Promise<IUser[]> {
    try {
      // Get all users except the current user
      const users = await User.find({ _id: { $ne: currentUserId } })
        .select('name email');
      
      return users;
    } catch (error) {
      logger.error('Get all users error', error);
      throw error;
    }
  }
  
  /**
   * Get user by ID
   * @param userId ID of the user to fetch
   * @returns User if found
   */
  static async getUserById(userId: string): Promise<IUser> {
    try {
      // Validate user ID
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }
      
      // Find user
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      logger.error('Get user by ID error', error);
      throw error;
    }
  }
  
  /**
   * Search users by name or email
   * @param searchTerm Search term
   * @param currentUserId ID of the current user
   * @returns Array of users matching the search term
   */
  static async searchUsers(searchTerm: string, currentUserId: string): Promise<IUser[]> {
    try {
      const users = await User.find({
        $and: [
          { _id: { $ne: currentUserId } },
          {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
              { email: { $regex: searchTerm, $options: 'i' } }
            ]
          }
        ]
      }).select('name email');
      
      return users;
    } catch (error) {
      logger.error('Search users error', error);
      throw error;
    }
  }
}