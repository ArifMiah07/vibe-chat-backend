import mongoose from 'mongoose';
import { logger } from '../utils/logger';


export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error: ${error.message}`);
    } else {
      logger.error('Unknown error occurred connecting to MongoDB');
    }
    process.exit(1);
  }
};