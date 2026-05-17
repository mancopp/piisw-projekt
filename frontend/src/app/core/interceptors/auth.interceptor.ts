import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const shouldAttachToken = Boolean(token) && isApiRequest(request.url);

  const requestWithAuth = shouldAttachToken
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : request;

  return next(requestWithAuth).pipe(
    catchError((error: unknown) => {
      if (shouldAttachToken && error instanceof HttpErrorResponse && error.status === 401) {
        authService.logout();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};

function isApiRequest(url: string): boolean {
  return url.startsWith(API_BASE_URL) || url.startsWith('/api/');
}
