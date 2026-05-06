import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketService);
  });

  it('should return VALID for activated ticket with matching vehicle', async () => {
    const result = await firstValueFrom(service.checkTicket('TCK-4Q7K8R2M9P', 'KR-105'));
    expect(result.status).toBe('VALID');
  });

  it('should return INVALID for random ticket code', async () => {
    const result = await firstValueFrom(service.checkTicket('TCK-AAAAAAAAAA', 'KR-105'));
    expect(result.status).toBe('INVALID');
    expect(result.reason).toContain('Nie znaleziono');
  });

  it('should return INVALID for known but not activated ticket', async () => {
    const result = await firstValueFrom(service.checkTicket('TCK-1A2B3C4D5E', 'KR-105'));
    expect(result.status).toBe('INVALID');
    expect(result.reason).toContain('nie jest aktywny');
  });

  it('should return INVALID for activated ticket used in different vehicle', async () => {
    const result = await firstValueFrom(service.checkTicket('TCK-4Q7K8R2M9P', 'KR-999'));
    expect(result.status).toBe('INVALID');
    expect(result.reason).toContain('innym pojeździe');
  });
});
