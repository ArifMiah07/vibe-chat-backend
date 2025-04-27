import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  DB_URL: process.env.MONGO_URI,
  JWT_SECRET:process.env.JWT_SECRET,
  JWT_EXPIRES_IN:process.env.JWT_EXPIRES_IN,
  FRONTEND_URL:process.env.FRONTEND_URL,
};
