import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should persist session after passenger login', async () => {
    const loginPromise = firstValueFrom(
      service.login({ email: 'passenger@test.pl', password: 'StrongPass1' }),
    );

    const request = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'passenger@test.pl',
      password: 'StrongPass1',
    });
    request.flush({
      accessToken: 'jwt-passenger',
      tokenType: 'Bearer',
      role: 'PASSENGER',
    });

    const response = await loginPromise;
    expect(response).toEqual({ token: 'jwt-passenger', role: 'PASSENGER' });
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getRole()).toBe('PASSENGER');
    expect(service.getUserEmail()).toBe('passenger@test.pl');
    expect(service.getHomeRoute()).toBe('/offer');
  });

  it('should assign inspector role after login', async () => {
    const loginPromise = firstValueFrom(
      service.login({ email: 'night-inspector@test.pl', password: 'StrongPass1' }),
    );

    const request = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
    expect(request.request.method).toBe('POST');
    request.flush({
      accessToken: 'jwt-inspector',
      tokenType: 'Bearer',
      role: 'INSPECTOR',
    });

    await loginPromise;
    expect(service.getRole()).toBe('INSPECTOR');
    expect(service.getHomeRoute()).toBe('/inspector/check');
  });

  it('should clear all session keys on logout', () => {
    localStorage.setItem('ebilet_token', 'token');
    localStorage.setItem('ebilet_role', 'PASSENGER');
    localStorage.setItem('ebilet_email', 'user@test.pl');

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.getRole()).toBeNull();
    expect(service.getUserEmail()).toBeNull();
    expect(service.getHomeRoute()).toBe('/login');
  });

  it('should return null role for unsupported role value in storage', () => {
    localStorage.setItem('ebilet_token', 'token');
    localStorage.setItem('ebilet_role', 'ADMIN');
    localStorage.setItem('ebilet_email', 'user@test.pl');

    expect(service.getRole()).toBeNull();
    expect(service.getHomeRoute()).toBe('/login');
  });
});
