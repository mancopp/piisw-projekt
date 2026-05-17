import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { TicketService } from '../core/services/ticket.service';
import { TicketOffer } from '../core/models/ticket.dto';
import { OfferPageComponent } from './offer-page.component';

describe('OfferPageComponent', () => {
  let fixture: ComponentFixture<OfferPageComponent>;
  let offers: TicketOffer[];

  beforeEach(async () => {
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
        name: 'Bilet 20 min ulgowy',
        ticketType: 'TIME',
        fareType: 'REDUCED',
        durationMinutes: 20,
        price: 2.0,
      },
      {
        id: 3,
        name: 'Bilet jednorazowy normalny',
        ticketType: 'SINGLE',
        fareType: 'NORMAL',
        price: 6.0,
      },
    ];

    await TestBed.configureTestingModule({
      imports: [OfferPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: TicketService,
          useValue: {
            getOffers: () => of(offers),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OfferPageComponent);
    fixture.detectChanges(false);
  });

  it('should render loaded offers', () => {
    const cards = fixture.nativeElement.querySelectorAll('article');
    expect(cards.length).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('Bilet 20 min ulgowy');
  });

  it('should filter offers by selected ticket and fare type', () => {
    fixture.componentInstance['onFiltersChanged']({
      ticketType: 'TIME',
      fareType: 'REDUCED',
    });

    const filteredOffers = fixture.componentInstance['filteredOffers']();
    expect(filteredOffers).toHaveLength(1);
    expect(filteredOffers[0]?.name).toBe('Bilet 20 min ulgowy');
  });

  it('should show empty state when no offer matches filters', () => {
    fixture.componentInstance['onFiltersChanged']({
      ticketType: 'PERIOD',
      fareType: 'REDUCED',
    });

    expect(fixture.componentInstance['filteredOffers']()).toHaveLength(0);
  });
});
