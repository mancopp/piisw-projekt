import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { TicketOffer, MyTicket } from '../models/ticket.dto';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly mockMyTickets: MyTicket[] = [
    {
      id: 101,
      code: 'TCK-12345ABC',
      ticketType: 'SINGLE',
      fareType: 'NORMAL',
      status: 'PURCHASED',
      purchasedAt: new Date().toISOString(),
    },
    {
      id: 102,
      code: 'TCK-98765XYZ',
      ticketType: 'TIME',
      fareType: 'NORMAL',
      status: 'ACTIVATED',
      purchasedAt: new Date(Date.now() - 3600000).toISOString(),
      activatedAt: new Date(Date.now() - 600000).toISOString(),
      validFrom: new Date(Date.now() - 600000).toISOString(),
      validTo: new Date(Date.now() + 600000).toISOString(),
    },
  ];

  constructor() {}

  getOffers(): Observable<TicketOffer[]> {
    const mockOffers: TicketOffer[] = [
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
      {
        id: 4,
        name: 'Bilet miesięczny normalny',
        ticketType: 'PERIOD',
        fareType: 'NORMAL',
        validityDays: 30,
        price: 110.0,
      },
    ];
    return of(mockOffers);
  }

  purchaseTicket(offerId: number): Observable<{ success: boolean }> {
    console.log(`Symulacja zakupu biletu z oferty ID: ${offerId}`);
    return of({ success: true }).pipe(delay(1000));
  }

  getMyTickets(): Observable<MyTicket[]> {
    return of(this.mockMyTickets);
  }

  getMyTicketById(ticketId: number): Observable<MyTicket | undefined> {
    return of(this.mockMyTickets.find((ticket) => ticket.id === ticketId));
  }

  checkTicket(
    ticketCode: string,
    vehicleId: string,
  ): Observable<{ status: 'VALID' | 'INVALID'; reason: string }> {
    console.log(`Sprawdzam bilet: ${ticketCode} w pojeździe ${vehicleId}`);

    const isValid = ticketCode.startsWith('TCK-');

    const mockResponse = {
      status: isValid ? ('VALID' as const) : ('INVALID' as const),
      reason: isValid ? 'Bilet aktywny i przypisany do pojazdu.' : 'Błędny kod lub bilet nieważny.',
    };

    return of(mockResponse);
  }
}
