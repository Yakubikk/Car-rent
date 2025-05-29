import type { AuthResponse, RegisterData, User } from "@/types/auth";
import apiClient from "./client";

export const AuthApi = {
  login: async (credentials: { email: string; password: string }) =>
    await apiClient.post<AuthResponse>("/login", credentials),

  register: async (data: RegisterData) => await apiClient.post("/auth/register", data),

  getMe: () => apiClient.get<User>("/api/users/get-me"),

  refreshToken: (refreshToken: string) =>
    apiClient.post<AuthResponse>("/refresh", { refreshToken }),
};

// Functions for handling registration approval and rejection
export const approveRegistration = async (email: string) => {
  const response = await apiClient.post('/api/auth/approve-registration', { email });
  return response.data;
};

export const rejectRegistration = async (email: string) => {
  const response = await apiClient.post('/api/auth/reject-registration', { email });
  return response.data;
};
