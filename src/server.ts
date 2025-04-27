import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import http from 'http';
import { connectDB } from './config/db';
import { setupSocketIO } from './sockets';
import { logger } from './utils/logger';


// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Setup Socket.IO
setupSocketIO(server);

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});