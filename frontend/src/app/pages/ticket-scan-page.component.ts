import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowLeft, Copy, LucideAngularModule, QrCode } from 'lucide-angular';

import { MyTicket } from '../core/models/ticket.dto';
import { TicketService } from '../core/services/ticket.service';

@Component({
  selector: 'app-ticket-scan-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <section
      class="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 p-6 shadow-xl"
    >
      <a
        class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-white"
        [routerLink]="ticket ? ['/my-tickets', ticket.id] : ['/my-tickets']"
      >
        <lucide-angular [img]="backIcon" [size]="16" />
        Wróć
      </a>

      @if (ticket) {
        <article class="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
          <p class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <lucide-angular [img]="qrIcon" [size]="16" />
            Zeskanuj kod biletu
          </p>

          <img
            [src]="qrCodeUrl"
            [alt]="'Kod QR biletu ' + ticket.code"
            class="mx-auto h-64 w-64 rounded-xl border border-slate-200 object-contain"
          />

          <div class="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">Kod biletu</p>
            <p class="mt-1 break-all font-mono text-sm font-semibold text-slate-900">{{ ticket.code }}</p>

            <button
              type="button"
              class="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white transition hover:bg-slate-700"
              aria-label="Kopiuj kod"
              title="Kopiuj kod"
              (click)="copyCode()"
            >
              <lucide-angular [img]="copyIcon" [size]="16" />
            </button>

            @if (copyMessage) {
              <p class="mt-2 text-xs text-slate-600">{{ copyMessage }}</p>
            }
          </div>
        </article>
      } @else {
        <section class="rounded-xl border border-rose-200 bg-white p-4 text-sm text-rose-700 shadow-sm">
          Nie znaleziono biletu do wyświetlenia kodu QR.
        </section>
      }
    </section>
  `,
})
export class TicketScanPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketService = inject(TicketService);

  protected readonly backIcon = ArrowLeft;
  protected readonly qrIcon = QrCode;
  protected readonly copyIcon = Copy;
  protected ticket: MyTicket | null = null;
  protected copyMessage = '';

  protected get qrCodeUrl(): string {
    if (!this.ticket) {
      return '';
    }

    const encodedCode = encodeURIComponent(this.ticket.code);
    return `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodedCode}`;
  }

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
        console.error('Błąd pobierania biletu do skanowania', err);
      },
    });
  }

  protected copyCode(): void {
    if (!this.ticket) {
      return;
    }

    if (!navigator.clipboard) {
      this.copyMessage = 'Kopiowanie nie jest dostępne w tej przeglądarce.';
      return;
    }

    navigator.clipboard.writeText(this.ticket.code).then(
      () => {
        this.copyMessage = 'Kod skopiowany.';
      },
      (err: unknown) => {
        console.error('Nie udało się skopiować kodu biletu', err);
        this.copyMessage = 'Nie udało się skopiować kodu.';
      },
    );
  }
}
