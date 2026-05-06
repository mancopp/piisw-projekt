import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];
  const currentRole = authService.getRole();

  if (authService.isLoggedIn() && currentRole === expectedRole) {
    return true;
  }

  return router.parseUrl('/forbidden');
};
