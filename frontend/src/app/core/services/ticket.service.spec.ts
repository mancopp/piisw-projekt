import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let service: TicketService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TicketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return VALID for activated ticket with matching vehicle', async () => {
    const resultPromise = firstValueFrom(service.checkTicket('TCK-4Q7K8R2M9P', 'KR-105'));

    const request = httpMock.expectOne(`${API_BASE_URL}/inspector/check`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.ticketCode).toBe('TCK-4Q7K8R2M9P');
    expect(request.request.body.vehicleId).toBe('KR-105');
    expect(typeof request.request.body.controlTime).toBe('string');
    request.flush({
      ticketCode: 'TCK-4Q7K8R2M9P',
      status: 'VALID',
      reason: 'TIME_TICKET_ACTIVE',
      checkedAt: new Date().toISOString(),
    });

    const result = await resultPromise;
    expect(result.status).toBe('VALID');
  });

  it('should return INVALID for random ticket code', async () => {
    const resultPromise = firstValueFrom(service.checkTicket('TCK-AAAAAAAAAA', 'KR-105'));

    const request = httpMock.expectOne(`${API_BASE_URL}/inspector/check`);
    expect(request.request.method).toBe('POST');
    request.flush(
      { message: 'Nie znaleziono biletu!' },
      { status: 404, statusText: 'Not Found' },
    );

    const result = await resultPromise;
    expect(result.status).toBe('INVALID');
    expect(result.reason).toContain('Nie znaleziono');
  });

  it('should return INVALID for known but not activated ticket', async () => {
    const resultPromise = firstValueFrom(service.checkTicket('TCK-1A2B3C4D5E', 'KR-105'));

    const request = httpMock.expectOne(`${API_BASE_URL}/inspector/check`);
    expect(request.request.method).toBe('POST');
    request.flush({
      ticketCode: 'TCK-1A2B3C4D5E',
      status: 'INVALID',
      reason: 'TICKET_NOT_ACTIVATED',
      checkedAt: new Date().toISOString(),
    });

    const result = await resultPromise;
    expect(result.status).toBe('INVALID');
    expect(result.reason).toContain('TICKET_NOT_ACTIVATED');
  });

  it('should return INVALID for activated ticket used in different vehicle', async () => {
    const resultPromise = firstValueFrom(service.checkTicket('TCK-4Q7K8R2M9P', 'KR-999'));

    const request = httpMock.expectOne(`${API_BASE_URL}/inspector/check`);
    expect(request.request.method).toBe('POST');
    request.flush({
      ticketCode: 'TCK-4Q7K8R2M9P',
      status: 'INVALID',
      reason: 'VEHICLE_MISMATCH',
      checkedAt: new Date().toISOString(),
    });

    const result = await resultPromise;
    expect(result.status).toBe('INVALID');
    expect(result.reason).toContain('VEHICLE_MISMATCH');
  });
});
