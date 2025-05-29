import { AuthApi } from "@/api/auth";
import apiClient from "@/api/client";
import type { AuthResponse, RegisterData, User } from "@/types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<AuthResponse>("/login", credentials);

          set({
            isLoading: false,
          });

          // Сохраняем токены в localStorage для interceptor'а
          sessionStorage.setItem("accessToken", response.data.accessToken);
          localStorage.setItem("refreshToken", response.data.refreshToken);

          // Получаем данные пользователя
          await get().fetchUser();
        } catch (error) {
          set({
            user: null,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            error: error.response?.data?.message || "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.post("/auth/register", data);
          set({ isLoading: false });
        } catch (error) {
          set({
            user: null,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            error: error.response?.data?.message || "Registration failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null });
      },

      fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthApi.getMe();
          set({ user: response.data, isLoading: false, error: null });
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          set({ user: null, isLoading: false, error: error.response?.data?.message || "Failed to fetch user" });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
