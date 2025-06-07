import apiClient from "./client";
import type {Car} from "@/types/car.ts";

export const CarsApi = {
  getAll: async () => {
    try {
      const response = await apiClient.get<Car[]>("/api/cars");
      return response.data;
    } catch (error) {
      console.error("API error in getAll:", error);
      throw error;
    }
  },

  getCarById: async (id: string) => {
    try {
      const response = await apiClient.get<Car | undefined>(`/api/cars/${id}`);
      return response.data;
    } catch (error) {
      console.error("API error in getCarById:", error);
      throw error;
    }
  },

  getAvailableCars: async () => {
    try {
      const response = await apiClient.get<Car[]>("/api/cars/available");
      return response.data;
    } catch (error) {
      console.error("API error in getAvailableCars:", error);
      throw error;
    }
  },

  postCar: async (car: Car) => {
    try {
      const response = await apiClient.post<Car>("/api/cars", car);
      return response.data;
    } catch (error) {
      console.error("API error in postCar:", error);
      throw error;
    }
  },

  putCar: async (car: Car) => {
    try {
      const response = await apiClient.put<Car>(`/api/cars/${car.id}`, car);
      return response.data;
    } catch (error) {
      console.error("API error in putCar:", error);
      throw error;
    }
  },

  deleteCar: async (id: string) => {
    try {
      await apiClient.delete(`/api/cars/${id}`);
    } catch (error) {
      console.error("API error in deleteCar:", error);
      throw error;
    }
  },

  toggleCarAvailability: async (id: string, isAvailable: boolean) => {
    try {
      await apiClient.patch(`/api/cars/${id}/availability`, { isAvailable });
    } catch (error) {
      console.error("API error in toggleCarAvailability:", error);
      throw error;
    }
  }
};
