import type { User } from "@/types/auth";
import apiClient from "./client";

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
};
