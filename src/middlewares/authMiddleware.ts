import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { logger } from '../utils/logger';


// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from cookie
    if (req.cookies.token) {
      token = req.cookies.token;
    }
    // Alternative: Check headers for token if not using cookies
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found with this ID'
        });
        return;
      }

      // Set user to request object
      req.user = user;
      next();
    } catch (error) {
      logger.error('Token validation error', error);
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};