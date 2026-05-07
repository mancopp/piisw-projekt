import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { TicketScanPageComponent } from './ticket-scan-page.component';
import { TicketService } from '../core/services/ticket.service';

describe('TicketScanPageComponent', () => {
  const ticket = {
    id: 102,
    code: 'TCK-4Q7K8R2M9P',
    ticketType: 'TIME' as const,
    fareType: 'NORMAL' as const,
    status: 'ACTIVATED' as const,
    purchasedAt: new Date().toISOString(),
  };

  it('should load ticket by id and expose encoded QR URL', async () => {
    await TestBed.configureTestingModule({
      imports: [TicketScanPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ ticketId: '102' }),
            },
          },
        },
        {
          provide: TicketService,
          useValue: {
            getMyTicketById: () => of(ticket),
          },
        },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<TicketScanPageComponent> =
      TestBed.createComponent(TicketScanPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance['ticket']?.code).toBe('TCK-4Q7K8R2M9P');
    expect(fixture.componentInstance['qrCodeUrl']).toContain(
      'data=TCK-4Q7K8R2M9P',
    );
  });

  it('should not request ticket data when route param is invalid', async () => {
    const getMyTicketById = vi.fn(() => of(ticket));

    await TestBed.configureTestingModule({
      imports: [TicketScanPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ ticketId: 'NaN' }),
            },
          },
        },
        {
          provide: TicketService,
          useValue: {
            getMyTicketById,
          },
        },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<TicketScanPageComponent> =
      TestBed.createComponent(TicketScanPageComponent);
    fixture.detectChanges();

    expect(getMyTicketById).not.toHaveBeenCalled();
  });

  it('should show clipboard unavailable message when clipboard API is missing', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    await TestBed.configureTestingModule({
      imports: [TicketScanPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ ticketId: '102' }),
            },
          },
        },
        {
          provide: TicketService,
          useValue: {
            getMyTicketById: () => of(ticket),
          },
        },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<TicketScanPageComponent> =
      TestBed.createComponent(TicketScanPageComponent);
    fixture.detectChanges();

    fixture.componentInstance['copyCode']();
    expect(fixture.componentInstance['copyMessage']).toContain('Kopiowanie nie jest dostępne');
  });
});
