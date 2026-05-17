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
    const token = createToken(3600);
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
      accessToken: token,
      tokenType: 'Bearer',
      role: 'PASSENGER',
    });

    const response = await loginPromise;
    expect(response).toEqual({ token, role: 'PASSENGER' });
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getRole()).toBe('PASSENGER');
    expect(service.getUserEmail()).toBe('passenger@test.pl');
    expect(service.getHomeRoute()).toBe('/offer');
  });

  it('should assign inspector role after login', async () => {
    const token = createToken(3600);
    const loginPromise = firstValueFrom(
      service.login({ email: 'night-inspector@test.pl', password: 'StrongPass1' }),
    );

    const request = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
    expect(request.request.method).toBe('POST');
    request.flush({
      accessToken: token,
      tokenType: 'Bearer',
      role: 'INSPECTOR',
    });

    await loginPromise;
    expect(service.getRole()).toBe('INSPECTOR');
    expect(service.getHomeRoute()).toBe('/inspector/check');
  });

  it('should clear all session keys on logout', () => {
    localStorage.setItem('ebilet_token', createToken(3600));
    localStorage.setItem('ebilet_role', 'PASSENGER');
    localStorage.setItem('ebilet_email', 'user@test.pl');

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.getRole()).toBeNull();
    expect(service.getUserEmail()).toBeNull();
    expect(service.getHomeRoute()).toBe('/login');
  });

  it('should return null role for unsupported role value in storage', () => {
    localStorage.setItem('ebilet_token', createToken(3600));
    localStorage.setItem('ebilet_role', 'ADMIN');
    localStorage.setItem('ebilet_email', 'user@test.pl');

    expect(service.getRole()).toBeNull();
    expect(service.getHomeRoute()).toBe('/login');
  });

  it('should invalidate and clear expired token from storage', () => {
    localStorage.setItem('ebilet_token', createToken(-60));
    localStorage.setItem('ebilet_role', 'PASSENGER');
    localStorage.setItem('ebilet_email', 'user@test.pl');

    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getRole()).toBeNull();
    expect(service.getUserEmail()).toBeNull();
    expect(localStorage.getItem('ebilet_token')).toBeNull();
    expect(localStorage.getItem('ebilet_role')).toBeNull();
    expect(localStorage.getItem('ebilet_email')).toBeNull();
  });

  it('should invalidate malformed token payload', () => {
    localStorage.setItem('ebilet_token', 'malformed.token.value');
    localStorage.setItem('ebilet_role', 'PASSENGER');
    localStorage.setItem('ebilet_email', 'user@test.pl');

    expect(service.isLoggedIn()).toBe(false);
    expect(service.getHomeRoute()).toBe('/login');
  });
});

function createToken(expirationOffsetSeconds: number): string {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url({ alg: 'HS256', typ: 'JWT' });
  const payload = encodeBase64Url({
    sub: 'user@test.pl',
    exp: nowInSeconds + expirationOffsetSeconds,
  });
  return `${header}.${payload}.signature`;
}

function encodeBase64Url(value: object): string {
  return globalThis.btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
