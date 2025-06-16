//src/routes/messageRoutes.ts

import express from 'express';
import { getMessages, sendMessage, markAsRead } from '../controllers/messageController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/')
  .post(sendMessage);

router.route('/:userId')
  .get(getMessages);

router.route('/read/:userId')
  .put(markAsRead);

export default router;