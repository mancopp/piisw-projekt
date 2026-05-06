import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule, QrCode, Ticket } from 'lucide-angular';

import { MyTicket } from '../core/models/ticket.dto';
import { TicketService } from '../core/services/ticket.service';

@Component({
  selector: 'app-ticket-details-page',
  standalone: true,
  imports: [DatePipe, RouterLink, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-3xl space-y-6">
      <a
        class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        routerLink="/my-tickets"
      >
        <lucide-angular [img]="backIcon" [size]="16" />
        Wróć do listy biletów
      </a>

      @if (ticket) {
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <header class="mb-6 space-y-1">
            <h2 class="inline-flex items-center gap-2 text-2xl font-semibold text-slate-900">
              <lucide-angular [img]="ticketIcon" [size]="22" />
              Szczegóły biletu
            </h2>
            <p class="text-sm text-slate-600">Pełne informacje o wybranym bilecie.</p>
          </header>

          <dl class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">ID</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">{{ ticket.id }}</dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Kod</dt>
              <dd class="mt-1 font-mono text-sm text-slate-900">{{ ticket.code }}</dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Typ biletu</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">{{ ticket.ticketType }}</dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Taryfa</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">{{ ticket.fareType }}</dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">{{ ticket.status }}</dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Data zakupu
              </dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ ticket.purchasedAt | date: 'yyyy-MM-dd HH:mm' }}
              </dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Data aktywacji
              </dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ ticket.activatedAt ? (ticket.activatedAt | date: 'yyyy-MM-dd HH:mm') : '—' }}
              </dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Pojazd kasowania
              </dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ ticket.activatedVehicleId ?? '—' }}
              </dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Ważny od
              </dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ ticket.validFrom ? (ticket.validFrom | date: 'yyyy-MM-dd HH:mm') : '—' }}
              </dd>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Ważny do
              </dt>
              <dd class="mt-1 text-sm font-medium text-slate-900">
                {{ ticket.validTo ? (ticket.validTo | date: 'yyyy-MM-dd HH:mm') : '—' }}
              </dd>
            </div>
          </dl>

          <div class="mt-6">
            <a
              class="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              [routerLink]="['/my-tickets', ticket.id, 'scan']"
            >
              <lucide-angular [img]="scanIcon" [size]="16" />
              Otwórz ekran do skanowania
            </a>
          </div>
        </section>
      } @else {
        <section class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Nie znaleziono biletu o podanym identyfikatorze.
        </section>
      }
    </div>
  `,
})
export class TicketDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketService = inject(TicketService);

  protected readonly backIcon = ArrowLeft;
  protected readonly ticketIcon = Ticket;
  protected readonly scanIcon = QrCode;
  protected ticket: MyTicket | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('ticketId');
    const ticketId = Number(idParam);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return;
    }

    this.ticketService.getMyTicketById(ticketId).subscribe({
      next: (ticket) => {
        this.ticket = ticket ?? null;
      },
      error: (err) => {
        console.error('Błąd pobierania szczegółów biletu', err);
      },
    });
  }
}
