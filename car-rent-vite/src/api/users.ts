import type { User } from "@/types/auth";
import apiClient from "./client";

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  isActive: boolean;
}

export interface UpdateUserData {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  isActive: boolean;
}

export const UsersApi = {
  getAll: async () => {
    try {
      const response = await apiClient.get<User[]>("/api/users");
      return response.data;
    } catch (error) {
      console.error("API error in getAll:", error);
      throw error;
    }
  },

  getUserById: async (id: string) => {
    try {
      const response = await apiClient.get<User>(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("API error in getUserById:", error);
      throw error;
    }
  },

  // Try multiple methods to get a user by email
  getUserByEmail: async (email: string) => {
    try {
      const response = await apiClient.get<User | undefined>("/api/users/by-email", {
        params: { email },
      });
      if (response.data) return response.data;
    } catch (error) {
      console.error("API error in getUserByEmail:", error);
      throw error;
    }
  },

  getGuestUsers: async () => {
    try {
      return apiClient.get("api/users/guest-users");
    } catch (error) {
      console.error("API error in getGuestUsers:", error);
      throw error;
    }
  },

  activate: async (email: string, activate: boolean) => {
    try {
      const response = await apiClient.post<User>(`/api/users/activate/${email}?activate=${activate}`);
      return response.data;
    } catch (error) {
      console.error("API error in activate:", error);
      throw error;
    }
  },

  createUser: async (userData: CreateUserData) => {
    try {
      const response = await apiClient.post<User>("/api/users", userData);
      return response.data;
    } catch (error) {
      console.error("API error in createUser:", error);
      throw error;
    }
  },

  updateUser: async (userData: UpdateUserData) => {
    try {
      const response = await apiClient.put<User>(`/api/users/${userData.id}`, userData);
      return response.data;
    } catch (error) {
      console.error("API error in updateUser:", error);
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      const response = await apiClient.delete<void>(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("API error in deleteUser:", error);
      throw error;
    }
  },
  
  updateAvatar: async (userId: string, avatarData: FormData) => {
    try {
      const response = await apiClient.post<User>(`/api/users/update-avatar`, avatarData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("API error in updateAvatar:", error);
      throw error;
    }
  },

  updateAvatarUrl: async (userId: string, externalUrl: string) => {
    try {
      const response = await apiClient.post<User>(`/api/users/${userId}/avatar`, {
        externalUrl
      });
      return response.data;
    } catch (error) {
      console.error("API error in updateAvatarUrl:", error);
      throw error;
    }
  },
};
