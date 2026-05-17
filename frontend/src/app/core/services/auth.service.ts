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
    const token = localStorage.getItem(AuthService.TOKEN_KEY);
    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return null;
    }

    return token;
  }

  logout(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.ROLE_KEY);
    localStorage.removeItem(AuthService.EMAIL_KEY);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getRole(): AuthResponse['role'] | null {
    if (!this.isLoggedIn()) {
      return null;
    }

    const role = localStorage.getItem(AuthService.ROLE_KEY);
    if (role === 'PASSENGER' || role === 'INSPECTOR') {
      return role;
    }

    return null;
  }

  getUserEmail(): string | null {
    if (!this.isLoggedIn()) {
      return null;
    }

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

  private isTokenExpired(token: string): boolean {
    const expiration = this.extractTokenExpiration(token);
    if (expiration === null) {
      return true;
    }

    return Date.now() >= expiration * 1000;
  }

  private extractTokenExpiration(token: string): number | null {
    const tokenParts = token.split('.');
    if (tokenParts.length < 2) {
      return null;
    }

    const payload = this.decodeJwtPayload(tokenParts[1]);
    if (!payload || typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
      return null;
    }

    return payload.exp;
  }

  private decodeJwtPayload(encodedPayload: string): { exp?: unknown } | null {
    const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (normalizedPayload.length % 4)) % 4;
    const paddedPayload = normalizedPayload + '='.repeat(paddingLength);

    try {
      return JSON.parse(globalThis.atob(paddedPayload)) as { exp?: unknown };
    } catch {
      return null;
    }
  }
}
