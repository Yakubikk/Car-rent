import api from './index';
import type { AuthResponse, Role } from '@/types';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  return api.post('/auth/login', { email, password });
};

export const register = async (
  name: string, 
  email: string, 
  password: string,
  role?: Role
): Promise<AuthResponse> => {
  return api.post('/auth/register', { name, email, password, role });
};

export const getCurrentUser = async () => {
  return api.get('/auth/me');
};

export const refreshToken = async (): Promise<{ token: string }> => {
  return api.post('/auth/refresh-token');
};
