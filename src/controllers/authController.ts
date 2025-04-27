import { Request, Response } from 'express';
import User from '../models/User';
import { sendTokenResponse } from '../utils/jwtHelper';
import { logger } from '../utils/logger';
import { registerSchema, loginSchema } from '../utils/validators';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const userExists = await User.findOne({ email: validatedData.email });
    
    if (userExists) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }
    
    // Create user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password
    });
    
    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error:any) {
    logger.error('Registration error', error);
    
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
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    
    // Find user by email
    const user = await User.findOne({ email: validatedData.email });
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(validatedData.password);
    
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }
    
    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error:any) {
    logger.error('Login error', error);
    
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
      message: 'Server error during login'
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = (req: Request, res: Response): void => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is already available in req due to the protect middleware
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    logger.error('Get me error', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};