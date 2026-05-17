import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { TicketDetailsPageComponent } from './ticket-details-page.component';
import { TicketService } from '../core/services/ticket.service';

describe('TicketDetailsPageComponent', () => {
  const ticket = {
    id: 102,
    code: 'TCK-4Q7K8R2M9P',
    ticketType: 'TIME' as const,
    fareType: 'NORMAL' as const,
    status: 'ACTIVATED' as const,
    purchasedAt: new Date().toISOString(),
    validTo: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
  };

  beforeEach(() => {
    vi.useRealTimers();
  });

  it('should load and render ticket details from route param', async () => {
    await TestBed.configureTestingModule({
      imports: [TicketDetailsPageComponent],
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

    const fixture: ComponentFixture<TicketDetailsPageComponent> =
      TestBed.createComponent(TicketDetailsPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const pageText = fixture.nativeElement.textContent as string;
    expect(pageText).toContain('Status: ACTIVATED');
    expect(pageText).toContain('TCK-4Q7K8R2M9P');
  });

  it('should toggle copied state after successful copy action', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await TestBed.configureTestingModule({
      imports: [TicketDetailsPageComponent],
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

    const fixture: ComponentFixture<TicketDetailsPageComponent> =
      TestBed.createComponent(TicketDetailsPageComponent);
    fixture.detectChanges();

    fixture.componentInstance.copyCode('TCK-4Q7K8R2M9P');
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith('TCK-4Q7K8R2M9P');
    expect(fixture.componentInstance['copied']()).toBe(true);

    vi.advanceTimersByTime(2000);
    expect(fixture.componentInstance['copied']()).toBe(false);
  });
});
