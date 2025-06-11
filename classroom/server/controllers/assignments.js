import { PrismaClient } from '../../src/generated/prisma/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Create a new assignment
export const createAssignment = async (req, res, next) => {
  try {
    const { title, description, dueDate, totalPoints, isPublished, classId } = req.body;
    const creatorId = req.user.id;
    
    // Check if the class exists
    const classData = await prisma.class.findUnique({
      where: { id: classId }
    });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if user is authorized (teacher or admin)
    const isTeacher = classData.ownerId === creatorId;
    const isAdmin = req.user.role === 'ADMIN';
    
    if (!isTeacher && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to create assignments for this class' });
    }
    
    // Create the assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        totalPoints: totalPoints || 100,
        isPublished: isPublished || false,
        classId,
        creatorId
      }
    });
    
    // Handle file attachments if any
    const files = req.files;
    
    if (files && files.length > 0) {
      const attachmentPromises = files.map(async (file) => {
        return prisma.assignmentAttachment.create({
          data: {
            filename: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileType: file.mimetype,
            assignmentId: assignment.id
          }
        });
      });
      
      await Promise.all(attachmentPromises);
    }
      // If published, notify students via socket.io
    if (assignment.isPublished && req.io) {
      req.io.to(`class:${classId}`).emit('class:assignment:new', {
        assignmentId: assignment.id,
        classId,
        title: assignment.title,
        dueDate: assignment.dueDate
      });
    }
    
    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    next(error);
  }
};

// Get all assignments for a class
export const getClassAssignments = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Check if the class exists
    const classData = await prisma.class.findUnique({
      where: { id: classId }
    });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if user has access to this class
    const isOwner = classData.ownerId === userId;
    const isAdmin = userRole === 'ADMIN';
    const isEnrolled = await prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId,
          classId
        }
      }
    });
    
    if (!isOwner && !isAdmin && !isEnrolled) {
      return res.status(403).json({ message: 'You do not have access to this class' });
    }
    
    // Get assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        classId,
        // Students can only see published assignments
        ...(userRole === 'STUDENT' && !isAdmin ? { isPublished: true } : {})
      },
      include: {
        attachments: true,
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        // Include the student's submission if applicable
        ...(userRole === 'STUDENT' ? {
          submissions: {
            where: {
              studentId: userId
            }
          }
        } : {})
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// Get all assignments for the authenticated user
export const getAllAssignments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let assignments = [];
    
    // Admin can see all assignments
    if (userRole === 'ADMIN') {
      assignments = await prisma.assignment.findMany({
        include: {
          class: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          attachments: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } 
    // Teachers see assignments they created or assignments in classes they own
    else if (userRole === 'TEACHER') {
      assignments = await prisma.assignment.findMany({
        where: {
          OR: [
            { creatorId: userId },
            { class: { ownerId: userId } }
          ]
        },
        include: {
          class: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          attachments: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } 
    // Students see assignments in classes they're enrolled in
    else {
      assignments = await prisma.assignment.findMany({
        where: {
          class: {
            enrollments: {
              some: {
                userId
              }
            }
          },
          isPublished: true
        },
        include: {
          class: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          attachments: true,
          submissions: {
            where: {
              studentId: userId
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }
    
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// Get an assignment by ID
export const getAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Find the assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        attachments: true,
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        class: true,
        submissions: userRole === 'STUDENT' ? {
          where: {
            studentId: userId
          },
          include: {
            attachments: true
          }
        } : {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            attachments: true
          }
        }
      }
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user has access to this assignment
    const isCreator = assignment.creatorId === userId;
    const isClassOwner = assignment.class.ownerId === userId;
    const isAdmin = userRole === 'ADMIN';
    const isStudent = await prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId,
          classId: assignment.classId
        }
      }
    });
    
    // Students can only see published assignments
    if (userRole === 'STUDENT' && !assignment.isPublished && !isAdmin) {
      return res.status(403).json({ message: 'This assignment is not published yet' });
    }
    
    if (!isCreator && !isClassOwner && !isAdmin && !isStudent) {
      return res.status(403).json({ message: 'You do not have access to this assignment' });
    }
    
    res.json(assignment);
  } catch (error) {
    next(error);
  }
};

// Update an assignment
export const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, totalPoints, isPublished } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Find the assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        class: true
      }
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is authorized to update
    const isCreator = assignment.creatorId === userId;
    const isClassOwner = assignment.class.ownerId === userId;
    const isAdmin = userRole === 'ADMIN';
    
    if (!isCreator && !isClassOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to update this assignment' });
    }
    
    // Check if assignment was previously unpublished but is now being published
    const isNewlyPublished = !assignment.isPublished && isPublished;
    
    // Update the assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : assignment.dueDate,
        totalPoints: totalPoints || assignment.totalPoints,
        isPublished: isPublished !== undefined ? isPublished : assignment.isPublished
      }
    });
    
    // If newly published, notify students via socket.io
    if (isNewlyPublished) {
      req.io?.to(`class-${assignment.classId}`).emit('assignment-published', {
        assignmentId: id,
        classId: assignment.classId,
        title: updatedAssignment.title
      });
    } else if (isPublished !== false) {
      // Notify about updates to already published assignments
      req.io?.to(`class-${assignment.classId}`).emit('assignment-updated', {
        assignmentId: id,
        classId: assignment.classId,
        title: updatedAssignment.title
      });
    }
    
    res.json({
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    next(error);
  }
};

// Delete an assignment
export const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Find the assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        class: true,
        attachments: true
      }
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is authorized to delete
    const isCreator = assignment.creatorId === userId;
    const isClassOwner = assignment.class.ownerId === userId;
    const isAdmin = userRole === 'ADMIN';
    
    if (!isCreator && !isClassOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to delete this assignment' });
    }
    
    // Delete assignment files from disk
    if (assignment.attachments.length > 0) {
      for (const attachment of assignment.attachments) {
        const filePath = path.join(uploadsDir, path.basename(attachment.fileUrl));
        try {
          await fs.access(filePath);
          await fs.unlink(filePath);
        } catch (err) {
          console.error(`Failed to delete file ${filePath}:`, err);
        }
      }
    }
    
    // Delete the assignment
    await prisma.assignment.delete({
      where: { id }
    });
    
    // Notify via socket.io
    req.io?.to(`class-${assignment.classId}`).emit('assignment-deleted', {
      assignmentId: id,
      classId: assignment.classId
    });
    
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Submit an assignment
export const submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { content } = req.body;
    const studentId = req.user.id;
    
    // Find the assignment
    const assignment = await prisma.assignment.findUnique({
      where: { 
        id: assignmentId,
        isPublished: true
      },
      include: {
        class: true
      }
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found or not published' });
    }
    
    // Check if the student is enrolled in the class
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId: studentId,
          classId: assignment.classId
        }
      }
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this class' });
    }
    
    // Check if assignment is past due
    const isLate = assignment.dueDate ? new Date() > new Date(assignment.dueDate) : false;
    
    // Check if submission already exists
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId
        }
      }
    });
    
    let submission;
    
    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.submission.update({
        where: {
          id: existingSubmission.id
        },
        data: {
          content,
          isLate,
          submittedAt: new Date()
        }
      });
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          content,
          isLate,
          assignmentId,
          studentId
        }
      });
    }
    
    // Handle file attachments if any
    const files = req.files;
    
    if (files && files.length > 0) {
      // Delete old attachments if updating submission
      if (existingSubmission) {
        const oldAttachments = await prisma.submissionAttachment.findMany({
          where: {
            submissionId: existingSubmission.id
          }
        });
        
        // Delete files from disk
        for (const attachment of oldAttachments) {
          const filePath = path.join(uploadsDir, path.basename(attachment.fileUrl));
          try {
            await fs.access(filePath);
            await fs.unlink(filePath);
          } catch (err) {
            console.error(`Failed to delete file ${filePath}:`, err);
          }
        }
        
        // Delete attachments from database
        await prisma.submissionAttachment.deleteMany({
          where: {
            submissionId: existingSubmission.id
          }
        });
      }
      
      // Create new attachments
      const attachmentPromises = files.map(async (file) => {
        return prisma.submissionAttachment.create({
          data: {
            filename: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileType: file.mimetype,
            submissionId: submission.id
          }
        });
      });
      
      await Promise.all(attachmentPromises);
    }
      // Notify teacher via socket.io
    // Send to both the assignment room and the class room
    if (req.io) {
      req.io.to(`assignment:${assignmentId}`).emit('assignment:submission:new', {
        assignmentId,
        classId: assignment.classId,
        studentId,
        submissionId: submission.id,
        studentName: req.user.name
      });
      
      req.io.to(`class:${assignment.classId}`).emit('class:assignment:update', {
        assignmentId,
        classId: assignment.classId,
        action: 'submission',
        studentId
      });
    }
    
    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    next(error);
  }
};

// Grade a submission
export const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Find the submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            class: true
          }
        }
      }
    });
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if user is authorized to grade
    const isCreator = submission.assignment.creatorId === userId;
    const isClassOwner = submission.assignment.class.ownerId === userId;
    const isAdmin = userRole === 'ADMIN';
    
    if (!isCreator && !isClassOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to grade this submission' });
    }
    
    // Validate grade
    if (grade < 0 || grade > submission.assignment.totalPoints) {
      return res.status(400).json({ 
        message: `Grade must be between 0 and ${submission.assignment.totalPoints}` 
      });
    }
    
    // Update the submission with grade and feedback
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: parseInt(grade),
        feedback,
        gradedAt: new Date()
      }
    });
      // Notify student via socket.io
    if (req.io) {
      // Notify the specific assignment room
      req.io.to(`assignment:${submission.assignmentId}`).emit('assignment:submission:graded', {
        submissionId,
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        grade: updatedSubmission.grade,
        feedback: updatedSubmission.feedback
      });
      
      // Also notify the class room about the update
      req.io.to(`class:${submission.assignment.classId}`).emit('class:assignment:update', {
        assignmentId: submission.assignmentId,
        classId: submission.assignment.classId,
        action: 'graded',
        submissionId
      });
    }
    
    res.json({
      message: 'Submission graded successfully',
      submission: updatedSubmission
    });
  } catch (error) {
    next(error);
  }
};
