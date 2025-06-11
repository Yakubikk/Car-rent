import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  refreshToken
} from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/refresh-token', authenticate, refreshToken);

export default router;
