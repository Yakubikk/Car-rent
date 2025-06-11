import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import {
  createPost,
  getClassPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  updateComment,
  deleteComment
} from '../controllers/posts.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All routes require authentication
router.use(authenticate);

// Create a post
router.post('/', upload.array('files', 5), createPost);

// Get all posts for a class
router.get('/class/:classId', getClassPosts);

// Get a post by ID
router.get('/:id', getPostById);

// Update a post
router.put('/:id', updatePost);

// Delete a post
router.delete('/:id', deletePost);

// Add a comment to a post
router.post('/:postId/comments', addComment);

// Update a comment
router.put('/comments/:id', updateComment);

// Delete a comment
router.delete('/comments/:id', deleteComment);

export default router;
