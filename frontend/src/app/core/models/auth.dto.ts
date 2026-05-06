export interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  role: 'PASSENGER' | 'INSPECTOR';
}

export interface RegisterRequest {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
}
