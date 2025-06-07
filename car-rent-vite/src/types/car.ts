type RentalStatus = 'Booked' | 'Active' | 'Completed' | 'Cancelled';

export interface Rental {
  id: string;
  carId: string;
  userId: string;
  startDateTime: string;
  endDateTime: string;
  status: RentalStatus;
  totalCost: number;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  pricePerHour: number;
  pricePerDay: number;
  isAvailable: boolean;
  imageUrl?: string;
  description?: string;
  fuelType: string;
  transmission: string;
  rentals?: Rental[];
}
