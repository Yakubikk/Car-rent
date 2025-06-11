import api from './index';
import type { Assignment, Submission } from '@/types';

export const createAssignment = async (data: FormData): Promise<{ message: string; assignment: Assignment }> => {
  return api.post('/assignments', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getClassAssignments = async (classId: string): Promise<Assignment[]> => {
  return api.get(`/assignments/class/${classId}`);
};

export const getAllAssignments = async (): Promise<Assignment[]> => {
  return api.get('/assignments');
};

export const getAssignmentById = async (id: string): Promise<Assignment> => {
  return api.get(`/assignments/${id}`);
};

export const updateAssignment = async (id: string, data: Partial<Assignment>): Promise<{ message: string; assignment: Assignment }> => {
  return api.put(`/assignments/${id}`, data);
};

export const deleteAssignment = async (id: string): Promise<{ message: string }> => {
  return api.delete(`/assignments/${id}`);
};

export const submitAssignment = async (assignmentId: string, data: FormData): Promise<{ message: string; submission: Submission }> => {
  return api.post(`/assignments/${assignmentId}/submit`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const gradeSubmission = async (
  submissionId: string, 
  grade: number, 
  feedback?: string
): Promise<{ message: string; submission: Submission }> => {
  return api.put(`/assignments/submissions/${submissionId}/grade`, { grade, feedback });
};
