import type { LoginRequest, RegisterRequest, User } from "@/types";
import axios, { type AxiosInstance } from "axios";

// Создаем экземпляр axios с базовым URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const register = async (credentials: RegisterRequest): Promise<void> => {
  try {
    await apiClient.post("api/user", credentials);
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

// API функция для входа в аккаунт
export const login = async (credentials: LoginRequest): Promise<void> => {
  try {
    await apiClient.post(`/login${credentials.rememberMe ? "?useCookies=true" : "?useSessionCookies=true"}`, {
      email: credentials.email,
      password: credentials.password,
    });
  } catch (error) {
    console.error("Login failed:", error);
  }
};

export const getMe = async (): Promise<User | undefined> => {
  try {
    const response = await apiClient.get<User>("/api/user/me");
    return response.data;
  } catch (error) {
    console.error("GetMe failed:", error);
  }
};
