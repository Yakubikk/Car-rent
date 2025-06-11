import api from './index';
import type { Class, Enrollment, User } from '@/types';

export const createClass = async (data: FormData): Promise<{ message: string; class: Class }> => {
  return api.post('/classes', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getAllClasses = async (): Promise<Class[]> => {
  return api.get('/classes');
};

export const getClassById = async (id: string): Promise<Class> => {
  return api.get(`/classes/${id}`);
};

export const updateClass = async (id: string, data: FormData): Promise<{ message: string; class: Class }> => {
  return api.put(`/classes/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const deleteClass = async (id: string): Promise<{ message: string }> => {
  return api.delete(`/classes/${id}`);
};

export const enrollInClass = async (enrollmentCode: string): Promise<{ message: string; enrollment: Enrollment }> => {
  return api.post('/classes/enroll', { enrollmentCode });
};

export const getClassStudents = async (classId: string): Promise<User[]> => {
  return api.get(`/classes/${classId}/students`);
};

export const removeStudentFromClass = async (classId: string, studentId: string): Promise<{ message: string }> => {
  return api.delete(`/classes/${classId}/students/${studentId}`);
};
