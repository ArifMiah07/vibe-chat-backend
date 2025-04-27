import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';


interface ErrorResponse extends Error {
  statusCode?: number;
  code?: number;
}

export const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  logger.error(`${err.stack}`);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new Error(message) as ErrorResponse;
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message) as ErrorResponse;
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err).map((val: any) => val.message).join(', ');
    error = new Error(message) as ErrorResponse;
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};