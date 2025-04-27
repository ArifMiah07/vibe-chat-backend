import express from 'express';
import { getUsers, getUserById } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUserById);

export default router;