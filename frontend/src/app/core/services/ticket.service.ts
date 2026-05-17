import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import {
  MyTicket,
  TicketOffer,
  TicketPurchaseResponse,
  TransactionResponse,
} from '../models/ticket.dto';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly http = inject(HttpClient);

  getOffers(): Observable<TicketOffer[]> {
    return this.http.get<TicketOffer[]>(`${API_BASE_URL}/offers`);
  }

  purchaseTicket(offerId: number, validFrom: string | null): Observable<TicketPurchaseResponse> {
    const payload: { offerId: number; validFrom?: string } = { offerId };
    if (validFrom) {
      payload.validFrom = `${validFrom}T00:00:00Z`;
    }

    return this.http.post<TicketPurchaseResponse>(`${API_BASE_URL}/tickets/purchase`, payload);
  }

  getMyTickets(): Observable<MyTicket[]> {
    return this.http.get<MyTicket[]>(`${API_BASE_URL}/tickets/my`);
  }

  getMyTicketById(ticketId: number): Observable<MyTicket> {
    return this.http.get<MyTicket>(`${API_BASE_URL}/tickets/my/${ticketId}`);
  }

  getMyTransactions(): Observable<TransactionResponse[]> {
    return this.http.get<TransactionResponse[]>(`${API_BASE_URL}/transactions/my`);
  }

  checkTicket(
    ticketCode: string,
    vehicleId: string,
  ): Observable<{ status: 'VALID' | 'INVALID'; reason: string }> {
    return this.http
      .post<{ status: 'VALID' | 'INVALID'; reason: string }>(
        `${API_BASE_URL}/inspector/check`,
        {
          ticketCode,
          vehicleId,
          controlTime: new Date().toISOString(),
        },
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of({
              status: 'INVALID' as const,
              reason: 'Nie znaleziono biletu o podanym kodzie.',
            });
          }

          return throwError(() => error);
        }),
      );
  }
}
