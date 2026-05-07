import { routes } from './app.routes';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

describe('app routes', () => {
  it('should keep login/register as guest-only routes', () => {
    const loginRoute = routes.find((route) => route.path === 'login');
    const registerRoute = routes.find((route) => route.path === 'register');

    expect(loginRoute?.canActivate).toEqual([guestGuard]);
    expect(registerRoute?.canActivate).toEqual([guestGuard]);
  });

  it('should protect passenger routes with authGuard + roleGuard and PASSENGER role', () => {
    const passengerPaths = [
      'offer',
      'offer/:offerId/purchase',
      'my-tickets',
      'my-tickets/:ticketId',
      'my-tickets/:ticketId/scan',
      'transactions',
    ];

    for (const path of passengerPaths) {
      const route = routes.find((candidate) => candidate.path === path);
      expect(route?.canActivate).toEqual([authGuard, roleGuard]);
      expect(route?.data).toEqual({ role: 'PASSENGER' });
    }
  });

  it('should protect inspector route with INSPECTOR role and include not-found fallback', () => {
    const inspectorRoute = routes.find((route) => route.path === 'inspector/check');
    expect(inspectorRoute?.canActivate).toEqual([authGuard, roleGuard]);
    expect(inspectorRoute?.data).toEqual({ role: 'INSPECTOR' });

    const wildcardRoute = routes.find((route) => route.path === '**');
    expect(wildcardRoute?.redirectTo).toBe('not-found');
  });
});
