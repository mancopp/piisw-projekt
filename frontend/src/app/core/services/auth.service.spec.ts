import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('should persist session after passenger login', async () => {
    vi.useFakeTimers();

    const loginPromise = firstValueFrom(
      service.login({ email: 'passenger@test.pl', password: 'StrongPass1' }),
    );
    vi.advanceTimersByTime(1000);

    await loginPromise;

    expect(service.isLoggedIn()).toBe(true);
    expect(service.getRole()).toBe('PASSENGER');
    expect(service.getUserEmail()).toBe('passenger@test.pl');
    expect(service.getHomeRoute()).toBe('/offer');
  });

  it('should assign inspector role for inspector email login', async () => {
    vi.useFakeTimers();

    const loginPromise = firstValueFrom(
      service.login({ email: 'night-inspector@test.pl', password: 'StrongPass1' }),
    );
    vi.advanceTimersByTime(1000);

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
