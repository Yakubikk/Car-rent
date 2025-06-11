import { PrismaClient } from '../../src/generated/prisma/index.js';
import { generateRandomCode } from '../utils/helpers.js';

const prisma = new PrismaClient();

// Create a new class
export const createClass = async (req, res, next) => {
  try {
    const { name, description, subject, coverImage } = req.body;
    const ownerId = req.user.id;
    
    // Generate a unique enrollment code
    const enrollmentCode = await generateRandomCode();
    
    // Create the class
    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        subject,
        coverImage,
        enrollmentCode,
        ownerId
      }
    });
    
    // Notify via socket.io
    req.io?.emit('class-created', {
      classId: newClass.id,
      name: newClass.name,
      ownerId
    });
    
    res.status(201).json({
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    next(error);
  }
};

// Get all classes (filtered by role)
export const getAllClasses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let classes = [];
    
    // Admin can see all classes
    if (userRole === 'ADMIN') {
      classes = await prisma.class.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: { enrollments: true }
          }
        }
      });
    } 
    // Teachers see their own classes
    else if (userRole === 'TEACHER') {
      classes = await prisma.class.findMany({
        where: {
          ownerId: userId
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: { enrollments: true }
          }
        }
      });
    } 
    // Students see classes they're enrolled in
    else {
      classes = await prisma.class.findMany({
        where: {
          enrollments: {
            some: {
              userId
            }
          }
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: { enrollments: true }
          }
        }
      });
    }
    
    res.json(classes);
  } catch (error) {
    next(error);
  }
};

// Get a class by ID
export const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Find the class
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if user has access to this class
    const isOwner = classData.ownerId === userId;
    const isEnrolled = classData.enrollments.some(e => e.userId === userId);
    const isAdmin = userRole === 'ADMIN';
    
    if (!isOwner && !isEnrolled && !isAdmin) {
      return res.status(403).json({ message: 'You do not have access to this class' });
    }
    
    res.json(classData);
  } catch (error) {
    next(error);
  }
};

// Update a class
export const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, subject, coverImage, isActive } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Find the class
    const classData = await prisma.class.findUnique({
      where: { id }
    });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if user is authorized to update
    const isOwner = classData.ownerId === userId;
    const isAdmin = userRole === 'ADMIN';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to update this class' });
    }
    
    // Update the class
    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        description,
        subject,
        coverImage,
        isActive: isActive !== undefined ? isActive : classData.isActive
      }
    });
    
    // Notify via socket.io
    req.io?.to(`class-${id}`).emit('class-updated', {
      classId: id,
      updates: updatedClass
    });
    
    res.json({
      message: 'Class updated successfully',
      class: updatedClass
    });
  } catch (error) {
    next(error);
  }
};

// Delete a class
export const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Find the class
    const classData = await prisma.class.findUnique({
      where: { id }
    });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if user is authorized to delete
    const isOwner = classData.ownerId === userId;
    const isAdmin = userRole === 'ADMIN';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to delete this class' });
    }
    
    // Delete the class
    await prisma.class.delete({
      where: { id }
    });
    
    // Notify via socket.io
    req.io?.emit('class-deleted', {
      classId: id
    });
    
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Enroll in a class using enrollment code
export const enrollInClass = async (req, res, next) => {
  try {
    const { enrollmentCode } = req.body;
    const userId = req.user.id;
    
    // Find the class by enrollment code
    const classData = await prisma.class.findUnique({
      where: { enrollmentCode }
    });
    
    if (!classData) {
      return res.status(404).json({ message: 'Invalid enrollment code' });
    }
    
    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId,
          classId: classData.id
        }
      }
    });
    
    if (existingEnrollment) {
      return res.status(409).json({ message: 'You are already enrolled in this class' });
    }
    
    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        classId: classData.id,
        role: 'STUDENT'
      },
      include: {
        class: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Notify via socket.io
    req.io?.to(`class-${classData.id}`).emit('user-enrolled', {
      classId: classData.id,
      user: enrollment.user
    });
    
    res.status(201).json({
      message: 'Successfully enrolled in class',
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

// Get all students in a class
export const getClassStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Find the class
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        enrollments: {
          where: {
            role: 'STUDENT'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if user has access to this class
    const isOwner = classData.ownerId === userId;
    const isEnrolled = await prisma.enrollment.findUnique({
      where: {
        userId_classId: {
          userId,
          classId: id
        }
      }
    });
    const isAdmin = userRole === 'ADMIN';
    
    if (!isOwner && !isEnrolled && !isAdmin) {
      return res.status(403).json({ message: 'You do not have access to this class' });
    }
    
    // Return the students
    const students = classData.enrollments.map(e => e.user);
    
    res.json(students);
  } catch (error) {
    next(error);
  }
};

// Remove a student from a class
export const removeStudentFromClass = async (req, res, next) => {
  try {
    const { classId, studentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Find the class
    const classData = await prisma.class.findUnique({
      where: { id: classId }
    });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if user is authorized to remove students
    const isOwner = classData.ownerId === userId;
    const isAdmin = userRole === 'ADMIN';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to remove students from this class' });
    }
    
    // Delete the enrollment
    await prisma.enrollment.delete({
      where: {
        userId_classId: {
          userId: studentId,
          classId
        }
      }
    });
    
    // Notify via socket.io
    req.io?.to(`class-${classId}`).emit('student-removed', {
      classId,
      studentId
    });
    
    res.json({ message: 'Student removed from class successfully' });
  } catch (error) {
    next(error);
  }
};
