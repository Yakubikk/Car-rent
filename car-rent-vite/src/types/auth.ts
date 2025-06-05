export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  driverLicense: string;
  driverLicenseIssueDate: string;
  birthDate: string;
  phoneNumber: string;
  address: string;
  registerDate: string;
  isActive: boolean;
  avatarUrl?: string;
  roles: string[];
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  driverLicense: string;
  driverLicenseIssueDate: string;
  birthDate: string;
  phoneNumber: string;
  address: string;
}

export interface LoginData {
  email: string;
  password: string;
}
