import express from 'express';
import multer from 'multer';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateProfile,
  deleteUser
} from '../controllers/users.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split('.').pop();
    cb(null, `avatar-${uniqueSuffix}.${extension}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Get all users (admin only)
router.get('/', authorize('ADMIN'), getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user
router.put('/:id', updateUser);

// Update profile
router.put('/profile/update', upload.single('avatar'), updateProfile);

// Delete user
router.delete('/:id', deleteUser);

export default router;
