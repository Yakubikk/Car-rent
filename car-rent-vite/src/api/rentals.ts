import apiClient from "./client";
import type { Rental } from "@/types/car.ts";

export const RentalsApi = {
  getAll: async () => {
    try {
      const response = await apiClient.get<Rental[]>("/api/rentals");
      return response.data;
    } catch (error) {
      console.error("API error in getAll:", error);
      throw error;
    }
  },

  getMy: async () => {
    try {
      const response = await apiClient.get<Rental[]>(`/api/rentals/myRentals`);
      return response.data;
    } catch (error) {
      console.error("API error in getMyRentals:", error);
      throw error;
    }
  },

  getRentalById: async (id: string) => {
    try {
      const response = await apiClient.get<Rental>(`/api/rentals/${id}`);
      return response.data;
    } catch (error) {
      console.error("API error in getRentalById:", error);
      throw error;
    }
  },

  postRental: async (rental: { carId: string; startDateTime: string; endDateTime: string }) => {
    try {
      const response = await apiClient.post<Rental>("/api/rentals", rental);
      return response.data;
    } catch (error) {
      console.error("API error in postRental:", error);
      throw error;
    }
  },

  getRentalsByUserId: async (userId: string) => {
    try {
      const response = await apiClient.get<Rental[]>(`/api/rentals/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("API error in getRentalByUserId:", error);
      throw error;
    }
  },

  cancelRental: async (rentalId: string) => {
    try {
      const response = await apiClient.post<Rental>(`/api/rentals/${rentalId}/cancel`);
      return response.data;
    } catch (error) {
      console.error("API error in cancelRental:", error);
      throw error;
    }
  },
};
