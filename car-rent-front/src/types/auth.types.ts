export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  drivingLicense: string;
  driverLicenseIssueDate: string;
  birthDate: string;
  phoneNumber: string;
  address: string;
}
