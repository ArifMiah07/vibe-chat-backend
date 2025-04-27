// Import SignOptions along with jwt
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';
import { Response } from 'express';
import { Types } from 'mongoose';
import config from '../config';

// Check if the secret exists
if (!config.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Assign the validated secret to a new constant. TypeScript knows this is a string.
const JWT_SECRET_STRING: string = config.JWT_SECRET;

// Generate JWT token
export const generateToken = (id: string): string => {
  const tokenOptions: SignOptions = {
    expiresIn: (config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) || '7d'
  };

  return jwt.sign(
    { id },
    JWT_SECRET_STRING,
    tokenOptions         
  );
};

// Set token in HTTP-only cookie
export const sendTokenResponse = (user: IUser, statusCode: number, res: Response): void => {
  const token = generateToken((user._id as Types.ObjectId).toString());

  let expiresInDays = 7; // Default value
  if (config.JWT_EXPIRES_IN) {
      const match = config.JWT_EXPIRES_IN.match(/^(\d+)d$/);
      if (match && match[1]) {
          expiresInDays = parseInt(match[1], 10);
      } else {
          // Handle other formats (h, m, s) or just use default if format is unexpected
          console.warn(`Could not parse JWT_EXPIRES_IN format: ${config.JWT_EXPIRES_IN}. Defaulting cookie expiry to 7 days.`);
      }
  }


  const options = {
    // Use the parsed number of days for cookie expiration
    expires: new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: config.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
};