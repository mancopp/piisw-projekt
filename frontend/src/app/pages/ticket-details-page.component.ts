import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowLeft, Copy, Check, LucideAngularModule } from 'lucide-angular';

import { MyTicket } from '../core/models/ticket.dto';
import { TicketService } from '../core/services/ticket.service';

@Component({
  selector: 'app-ticket-details-page',
  standalone: true,
  imports: [DatePipe, RouterLink, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-md space-y-6">
      <a
        class="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        routerLink="/my-tickets"
      >
        <lucide-angular [img]="backIcon" [size]="16" />
        Wróć do listy biletów
      </a>

      @if (ticket) {
        <div
          class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 shadow-2xl text-white"
        >
          <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
          <div
            class="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
          ></div>

          <div class="relative z-10 flex flex-col items-center text-center">
            <p class="mb-1 text-blue-100 font-medium uppercase tracking-wider text-xs">
              {{ ticket.ticketType }} - {{ ticket.fareType }}
            </p>

            <h2 class="mb-6 text-2xl font-bold">Status: {{ ticket.status }}</h2>

            <div class="mb-6 rounded-2xl bg-white p-4 shadow-inner">
              <img
                [src]="
                  'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + ticket.code
                "
                alt="Kod QR biletu"
                class="h-48 w-48 object-contain"
              />
            </div>

            <div
              class="mb-6 w-full rounded-xl bg-white/20 p-4 backdrop-blur-sm text-left flex justify-between items-center"
            >
              <div>
                <p class="text-sm text-blue-100 mb-1">Kod biletu</p>
                <p class="font-mono text-xl font-semibold tracking-widest">{{ ticket.code }}</p>
              </div>
              <div class="text-right text-xs text-blue-100">
                <p>Ważny do:</p>
                <p class="font-semibold">
                  {{ ticket.validTo ? (ticket.validTo | date: 'dd.MM.yyyy HH:mm') : '—' }}
                </p>
              </div>
            </div>

            <button
              (click)="copyCode(ticket.code)"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-600 shadow-md transition-all hover:bg-slate-50 hover:shadow-lg active:scale-95"
            >
              @if (copied) {
                <lucide-angular [img]="checkIcon" [size]="18" />
                Skopiowano do schowka!
              } @else {
                <lucide-angular [img]="copyIcon" [size]="18" />
                Skopiuj kod biletu
              }
            </button>
          </div>
        </div>
      } @else {
        <section class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Ładowanie biletu lub nie znaleziono podanego identyfikatora.
        </section>
      }
    </div>
  `,
})
export class TicketDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketService = inject(TicketService);

  protected readonly backIcon = ArrowLeft;
  protected readonly copyIcon = Copy;
  protected readonly checkIcon = Check;

  protected ticket: MyTicket | null = null;
  protected copied: boolean = false;

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

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
