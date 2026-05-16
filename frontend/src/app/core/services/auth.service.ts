import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import {
  AuthResponse,
  BackendAuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../models/auth.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly TOKEN_KEY = 'ebilet_token';
  private static readonly ROLE_KEY = 'ebilet_role';
  private static readonly EMAIL_KEY = 'ebilet_email';
  private readonly http = inject(HttpClient);

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<BackendAuthResponse>(`${API_BASE_URL}/auth/login`, data)
      .pipe(
        tap((response) => this.setSession(response.accessToken, response.role, data.email)),
        map((response) => ({ token: response.accessToken, role: response.role })),
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<BackendAuthResponse>(`${API_BASE_URL}/auth/register`, data)
      .pipe(
        tap((response) => this.setSession(response.accessToken, response.role, data.email)),
        map((response) => ({ token: response.accessToken, role: response.role })),
      );
  }

  private setSession(token: string, role: AuthResponse['role'], email: string): void {
    localStorage.setItem(AuthService.TOKEN_KEY, token);
    localStorage.setItem(AuthService.ROLE_KEY, role);
    localStorage.setItem(AuthService.EMAIL_KEY, email);
  }

  getToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.ROLE_KEY);
    localStorage.removeItem(AuthService.EMAIL_KEY);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(AuthService.TOKEN_KEY);
  }

  getRole(): AuthResponse['role'] | null {
    const role = localStorage.getItem(AuthService.ROLE_KEY);
    if (role === 'PASSENGER' || role === 'INSPECTOR') {
      return role;
    }

    return null;
  }

  getUserEmail(): string | null {
    return localStorage.getItem(AuthService.EMAIL_KEY);
  }

  getHomeRoute(): '/offer' | '/inspector/check' | '/login' {
    const role = this.getRole();
    if (role === 'INSPECTOR') {
      return '/inspector/check';
    }

    if (role === 'PASSENGER') {
      return '/offer';
    }

    return '/login';
  }
}
