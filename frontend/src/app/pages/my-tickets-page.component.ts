import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MyTicket } from '../core/models/ticket.dto';
import { TicketService } from '../core/services/ticket.service';

@Component({
  selector: 'app-my-tickets-page',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="space-y-4">
      <header class="space-y-1">
        <h2 class="text-2xl font-semibold text-slate-900">Moje bilety</h2>
        <p class="text-sm text-slate-600">Podgląd aktywnych i historycznych biletów użytkownika.</p>
      </header>

      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-left font-medium text-slate-700">
            <tr>
              <th class="px-4 py-3">Kod</th>
              <th class="px-4 py-3">Typ</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Ważność</th>
              <th class="px-4 py-3">Pojazd kasowania</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (ticket of tickets; track ticket.code) {
              <tr class="align-top text-slate-700">
                <td class="px-4 py-3 font-mono text-xs">{{ ticket.code }}</td>
                <td class="px-4 py-3">{{ ticket.ticketType }}</td>
                <td class="px-4 py-3">{{ ticket.status }}</td>
                <td class="px-4 py-3">
                  @if (ticket.validFrom && ticket.validTo) {
                    {{ ticket.validFrom | date: 'yyyy-MM-dd HH:mm' }} -
                    {{ ticket.validTo | date: 'yyyy-MM-dd HH:mm' }}
                  } @else {
                    —
                  }
                </td>
                <td class="px-4 py-3">{{ ticket.activatedVehicleId ?? '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class MyTicketsPageComponent implements OnInit {
  private ticketService = inject(TicketService);

  protected tickets: MyTicket[] = [];

  ngOnInit(): void {
    this.ticketService.getMyTickets().subscribe({
      next: (data) => {
        this.tickets = data;
      },
      error: (err) => console.error('Błąd pobierania biletów', err),
    });
  }
}
