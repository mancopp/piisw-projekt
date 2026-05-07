import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { PurchasePageComponent } from './purchase-page.component';
import { TicketService } from '../core/services/ticket.service';
import { TicketOffer } from '../core/models/ticket.dto';

describe('PurchasePageComponent', () => {
  let offers: TicketOffer[];

  beforeEach(() => {
    offers = [
      {
        id: 1,
        name: 'Bilet 20 min normalny',
        ticketType: 'TIME',
        fareType: 'NORMAL',
        durationMinutes: 20,
        price: 4.0,
      },
      {
        id: 2,
        name: 'Bilet miesięczny normalny',
        ticketType: 'PERIOD',
        fareType: 'NORMAL',
        validityDays: 30,
        price: 110.0,
      },
    ];
  });

  it('should load offer by route param and render purchase options', async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasePageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ offerId: '2' }),
            },
          },
        },
        {
          provide: TicketService,
          useValue: {
            getOffers: () => of(offers),
          },
        },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<PurchasePageComponent> =
      TestBed.createComponent(PurchasePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const pageText = fixture.nativeElement.textContent as string;
    expect(pageText).toContain('Bilet miesięczny normalny');
    expect(pageText).toContain('Opcje ważności biletu');
  });

  it('should not request offers for invalid route offer id', async () => {
    const getOffers = vi.fn(() => of(offers));

    await TestBed.configureTestingModule({
      imports: [PurchasePageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ offerId: 'bad-value' }),
            },
          },
        },
        {
          provide: TicketService,
          useValue: {
            getOffers,
          },
        },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<PurchasePageComponent> =
      TestBed.createComponent(PurchasePageComponent);
    fixture.detectChanges();

    expect(getOffers).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Nie znaleziono oferty o podanym identyfikatorze');
  });
});
