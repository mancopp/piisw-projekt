import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: { getToken: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = {
      getToken: vi.fn(() => 'valid-token'),
      logout: vi.fn(),
    };
    routerMock = {
      navigate: vi.fn(async () => true),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should attach Authorization header for API requests when token exists', async () => {
    const responsePromise = firstValueFrom(http.get<{ ok: boolean }>(`${API_BASE_URL}/tickets/my`));

    const request = httpMock.expectOne(`${API_BASE_URL}/tickets/my`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer valid-token');
    request.flush({ ok: true });

    await expect(responsePromise).resolves.toEqual({ ok: true });
  });

  it('should not attach Authorization header for non-API requests', async () => {
    const responsePromise = firstValueFrom(http.get<{ ok: boolean }>('https://example.com/public'));

    const request = httpMock.expectOne('https://example.com/public');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ ok: true });

    await expect(responsePromise).resolves.toEqual({ ok: true });
  });

  it('should logout and redirect to login on 401 from authenticated API request', async () => {
    const responsePromise = firstValueFrom(http.get(`${API_BASE_URL}/tickets/my`)).catch(() => null);

    const request = httpMock.expectOne(`${API_BASE_URL}/tickets/my`);
    request.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    await responsePromise;
    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
