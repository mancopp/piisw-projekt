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
      code: 'TCK-1A2B3C4D5E',
      ticketType: 'SINGLE',
      fareType: 'NORMAL',
      status: 'PURCHASED',
      purchasedAt: new Date().toISOString(),
    },
    {
      id: 102,
      code: 'TCK-4Q7K8R2M9P',
      ticketType: 'TIME',
      fareType: 'NORMAL',
      status: 'ACTIVATED',
      purchasedAt: new Date(Date.now() - 3600000).toISOString(),
      activatedAt: new Date(Date.now() - 600000).toISOString(),
      activatedVehicleId: 'KR-105',
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

    const ticket = this.mockMyTickets.find((item) => item.code === ticketCode);
    if (!ticket) {
      return of({
        status: 'INVALID',
        reason: 'Nie znaleziono biletu o podanym kodzie.',
      });
    }

    if (ticket.status !== 'ACTIVATED') {
      return of({
        status: 'INVALID',
        reason: 'Bilet nie jest aktywny.',
      });
    }

    if (!ticket.validFrom || !ticket.validTo) {
      return of({
        status: 'INVALID',
        reason: 'Brak danych o okresie ważności biletu.',
      });
    }

    const now = Date.now();
    const validFromTimestamp = new Date(ticket.validFrom).getTime();
    const validToTimestamp = new Date(ticket.validTo).getTime();

    if (now < validFromTimestamp || now > validToTimestamp) {
      return of({
        status: 'INVALID',
        reason: 'Bilet jest poza okresem ważności.',
      });
    }

    if (ticket.activatedVehicleId && ticket.activatedVehicleId !== vehicleId) {
      return of({
        status: 'INVALID',
        reason: 'Bilet został aktywowany w innym pojeździe.',
      });
    }

    return of({
      status: 'VALID',
      reason: 'Bilet aktywny i przypisany do wskazanego pojazdu.',
    });
  }
}
