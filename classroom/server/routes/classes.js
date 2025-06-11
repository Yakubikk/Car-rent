import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  enrollInClass,
  getClassStudents,
  removeStudentFromClass
} from '../controllers/classes.js';
import { authenticate, authorize } from '../middleware/auth.js';

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

// Create a class (teacher or admin only)
router.post('/', authorize('ADMIN', 'TEACHER'), upload.single('coverImage'), createClass);

// Get all classes
router.get('/', getAllClasses);

// Get a class by ID
router.get('/:id', getClassById);

// Update a class
router.put('/:id', authorize('ADMIN', 'TEACHER'), upload.single('coverImage'), updateClass);

// Delete a class
router.delete('/:id', authorize('ADMIN', 'TEACHER'), deleteClass);

// Enroll in a class
router.post('/enroll', enrollInClass);

// Get all students in a class
router.get('/:id/students', getClassStudents);

// Remove a student from a class
router.delete('/:classId/students/:studentId', authorize('ADMIN', 'TEACHER'), removeStudentFromClass);

export default router;
