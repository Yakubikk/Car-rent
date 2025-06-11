import api from './index';
import type { User, UserProfile } from '@/types';

export const getAllUsers = async (): Promise<User[]> => {
  return api.get('/users');
};

export const getUserById = async (id: string): Promise<User> => {
  return api.get(`/users/${id}`);
};

export const updateUser = async (id: string, data: Partial<User>): Promise<{ message: string; user: User }> => {
  return api.put(`/users/${id}`, data);
};

export const updateProfile = async (data: FormData): Promise<{ message: string; profile: UserProfile }> => {
  return api.put('/users/profile/update', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  return api.delete(`/users/${id}`);
};
