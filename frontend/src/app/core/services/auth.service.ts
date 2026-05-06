import {Injectable} from '@angular/core';
import {Observable, of, delay, tap} from 'rxjs';
import {LoginRequest, AuthResponse, RegisterRequest} from '../models/auth.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'ebilet_token';
  private readonly ROLE_KEY = 'ebilet_role';

  constructor() {}

  login(data: LoginRequest): Observable<AuthResponse> {
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token-1234',
      role: data.email.includes('inspector') ? 'INSPECTOR' : 'PASSENGER'
    };

    return of(mockResponse).pipe(
      delay(1000),
      tap((response: AuthResponse) => this.setSession(response))
    );
  }

  register(data: RegisterRequest): Observable<void> {
    console.log('Symulujemy rejestracje dla:', data.email);
    return of(undefined).pipe(delay(1000));
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.ROLE_KEY, authResult.role);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }
}
