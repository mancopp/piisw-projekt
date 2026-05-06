import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChevronRight, LucideAngularModule, Ticket } from 'lucide-angular';

import { MyTicket } from '../core/models/ticket.dto';
import { TicketService } from '../core/services/ticket.service';

@Component({
  selector: 'app-my-tickets-page',
  standalone: true,
  imports: [DatePipe, RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-4">
      <header class="space-y-1">
        <h2 class="inline-flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <lucide-angular [img]="ticketsIcon" [size]="22" />
          Moje bilety
        </h2>
        <p class="text-sm text-slate-600">Podgląd aktywnych i historycznych biletów użytkownika.</p>
      </header>

      @if (tickets.length > 0) {
        <section class="grid gap-4 sm:grid-cols-2">
          @for (ticket of tickets; track ticket.code) {
            <a
              class="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              [routerLink]="['/my-tickets', ticket.id]"
            >
              <div class="mb-4 flex items-start justify-between gap-3">
                <p class="font-mono text-xs text-slate-700">{{ ticket.code }}</p>
                <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  {{ ticket.status }}
                </span>
              </div>

              <dl class="space-y-2 text-sm text-slate-700">
                <div class="flex items-center justify-between gap-4">
                  <dt class="text-slate-500">Typ</dt>
                  <dd class="font-medium text-slate-900">{{ ticket.ticketType }}</dd>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <dt class="text-slate-500">Taryfa</dt>
                  <dd class="font-medium text-slate-900">{{ ticket.fareType }}</dd>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <dt class="text-slate-500">Ważność</dt>
                  <dd class="text-right font-medium text-slate-900">
                    @if (ticket.validFrom && ticket.validTo) {
                      {{ ticket.validFrom | date: 'yyyy-MM-dd HH:mm' }} -
                      {{ ticket.validTo | date: 'yyyy-MM-dd HH:mm' }}
                    } @else {
                      —
                    }
                  </dd>
                </div>
              </dl>

              <span class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                Szczegóły
                <lucide-angular [img]="detailsIcon" [size]="14" />
              </span>
            </a>
          }
        </section>
      } @else {
        <section class="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p class="text-sm text-slate-600">Brak biletów do wyświetlenia.</p>
        </section>
      }
    </div>
  `,
})
export class MyTicketsPageComponent implements OnInit {
  private ticketService = inject(TicketService);

  protected readonly ticketsIcon = Ticket;
  protected readonly detailsIcon = ChevronRight;
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
