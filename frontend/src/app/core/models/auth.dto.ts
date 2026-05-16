export type UserRole = 'PASSENGER' | 'INSPECTOR';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface BackendAuthResponse {
  accessToken: string;
  tokenType: string;
  role: UserRole;
}
