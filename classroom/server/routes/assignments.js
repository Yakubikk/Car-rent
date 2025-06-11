import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import {
  createAssignment,
  getClassAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getAllAssignments
} from '../controllers/assignments.js';
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All routes require authentication
router.use(authenticate);

// Create an assignment (teacher or admin only)
router.post('/', authorize('ADMIN', 'TEACHER'), upload.array('files', 5), createAssignment);

// Get all assignments for a class
router.get('/class/:classId', getClassAssignments);

// Get all assignments (for authenticated users)
router.get('/', getAllAssignments);

// Get an assignment by ID
router.get('/:id', getAssignmentById);

// Update an assignment
router.put('/:id', authorize('ADMIN', 'TEACHER'), updateAssignment);

// Delete an assignment
router.delete('/:id', authorize('ADMIN', 'TEACHER'), deleteAssignment);

// Submit an assignment
router.post('/:assignmentId/submit', upload.array('files', 5), submitAssignment);

// Grade a submission
router.put('/submissions/:submissionId/grade', authorize('ADMIN', 'TEACHER'), gradeSubmission);

export default router;
