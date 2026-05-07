import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('Route guards', () => {
  let authServiceMock: {
    isLoggedIn: () => boolean;
    getRole: () => 'PASSENGER' | 'INSPECTOR' | null;
    getHomeRoute: () => '/offer' | '/inspector/check' | '/login';
  };
  let routerMock: { parseUrl: (url: string) => UrlTree };

  beforeEach(() => {
    authServiceMock = {
      isLoggedIn: () => false,
      getRole: () => null,
      getHomeRoute: () => '/login',
    };

    routerMock = {
      parseUrl: (url: string) => ({ redirectedTo: url } as unknown as UrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('authGuard should allow logged user and redirect guest to /login', () => {
    authServiceMock.isLoggedIn = () => true;
    const allowed = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(allowed).toBe(true);

    authServiceMock.isLoggedIn = () => false;
    const redirected = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(redirected).toEqual({ redirectedTo: '/login' });
  });

  it('guestGuard should allow guest and redirect authenticated user to home route', () => {
    authServiceMock.isLoggedIn = () => false;
    const allowed = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));
    expect(allowed).toBe(true);

    authServiceMock.isLoggedIn = () => true;
    authServiceMock.getHomeRoute = () => '/offer';
    const redirected = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));
    expect(redirected).toEqual({ redirectedTo: '/offer' });
  });

  it('roleGuard should allow matching role and block mismatched role', () => {
    authServiceMock.isLoggedIn = () => true;
    authServiceMock.getRole = () => 'PASSENGER';
    const allowed = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { role: 'PASSENGER' } } as never, {} as never),
    );
    expect(allowed).toBe(true);

    authServiceMock.getRole = () => 'INSPECTOR';
    const blocked = TestBed.runInInjectionContext(() =>
      roleGuard({ data: { role: 'PASSENGER' } } as never, {} as never),
    );
    expect(blocked).toEqual({ redirectedTo: '/forbidden' });
  });
});
