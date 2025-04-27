import User, { IUser } from '../models/User';
import { RegisterInput, LoginInput } from '../utils/validators';
import { logger } from '../utils/logger';

export class AuthService {
  /**
   * Register a new user
   * @param userData User registration data
   * @returns Newly created user
   */
  static async registerUser(userData: RegisterInput): Promise<IUser> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password
      });
      
      return user;
    } catch (error) {
      logger.error('User registration error', error);
      throw error;
    }
  }
  
  /**
   * Authenticate user and check if password matches
   * @param loginData User login data
   * @returns User if authentication succeeds
   */
  static async loginUser(loginData: LoginInput): Promise<IUser> {
    try {
      // Find user by email
      const user = await User.findOne({ email: loginData.email });
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Check if password matches
      const isMatch = await user.comparePassword(loginData.password);
      
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
      
      return user;
    } catch (error) {
      logger.error('User login error', error);
      throw error;
    }
  }
}