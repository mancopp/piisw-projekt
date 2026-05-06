import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { TicketService } from '../core/services/ticket.service';
import { MyTicket } from '../core/models/ticket.dto';
import { MyTicketsPageComponent } from './my-tickets-page.component';

describe('MyTicketsPageComponent', () => {
  let fixture: ComponentFixture<MyTicketsPageComponent>;
  let component: MyTicketsPageComponent;
  let mockTickets: MyTicket[];

  beforeEach(async () => {
    mockTickets = [
      {
        id: 101,
        code: 'TCK-ABC-101',
        ticketType: 'SINGLE',
        fareType: 'NORMAL',
        status: 'PURCHASED',
        purchasedAt: new Date('2026-05-01T10:00:00.000Z').toISOString(),
      },
      {
        id: 102,
        code: 'TCK-ABC-102',
        ticketType: 'TIME',
        fareType: 'REDUCED',
        status: 'ACTIVATED',
        purchasedAt: new Date('2026-05-01T11:00:00.000Z').toISOString(),
        validFrom: new Date('2026-05-01T11:00:00.000Z').toISOString(),
        validTo: new Date('2026-05-01T11:20:00.000Z').toISOString(),
      },
    ];

    await TestBed.configureTestingModule({
      imports: [MyTicketsPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: TicketService,
          useValue: {
            getMyTickets: () => of(mockTickets),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyTicketsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render one clickable card per ticket with details route', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const cardLinks = fixture.nativeElement.querySelectorAll('a');
    expect(cardLinks.length).toBe(2);

    const firstHref = (cardLinks[0] as HTMLAnchorElement).getAttribute('href');
    const secondHref = (cardLinks[1] as HTMLAnchorElement).getAttribute('href');

    expect(firstHref).toContain('/my-tickets/101');
    expect(secondHref).toContain('/my-tickets/102');

    const pageText = fixture.nativeElement.textContent as string;
    expect(pageText).toContain('TCK-ABC-101');
    expect(pageText).toContain('TCK-ABC-102');
  });

  it('should show empty state when user has no tickets', () => {
    mockTickets = [];
    fixture = TestBed.createComponent(MyTicketsPageComponent);
    fixture.detectChanges();

    const pageText = fixture.nativeElement.textContent as string;
    expect(pageText).toContain('Twój portfel biletów jest pusty');
  });
});
