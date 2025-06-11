import { PrismaClient } from '../../src/generated/prisma/index.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Generate a random string
export const generateRandomString = (length = 6) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
};

// Generate a unique class enrollment code
export const generateRandomCode = async () => {
  // Generate a random code
  let code = generateRandomString(6);
  
  // Check if it already exists
  let existingClass = await prisma.class.findUnique({
    where: { enrollmentCode: code }
  });
  
  // If it exists, generate a new one until we find a unique code
  while (existingClass) {
    code = generateRandomString(6);
    existingClass = await prisma.class.findUnique({
      where: { enrollmentCode: code }
    });
  }
  
  return code;
};

// Format date to a readable string
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

// Check if a user is a teacher of a class
export const isTeacherOfClass = async (userId, classId) => {
  const classData = await prisma.class.findUnique({
    where: { id: classId }
  });
  
  return classData?.ownerId === userId;
};

// Check if a user is a student in a class
export const isStudentInClass = async (userId, classId) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_classId: {
        userId,
        classId
      }
    }
  });
  
  return !!enrollment;
};

// Check if a user has access to a class (as teacher, student, or admin)
export const hasAccessToClass = async (userId, classId, userRole) => {
  if (userRole === 'ADMIN') return true;
  
  const isTeacher = await isTeacherOfClass(userId, classId);
  if (isTeacher) return true;
  
  const isStudent = await isStudentInClass(userId, classId);
  if (isStudent) return true;
  
  return false;
};
