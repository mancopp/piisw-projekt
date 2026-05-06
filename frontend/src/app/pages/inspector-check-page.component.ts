import { Component, inject } from '@angular/core';
import {
  InspectorCheckFormComponent,
  InspectorCheckFormValue,
} from '../components/forms/inspector-check-form.component';

import { TicketService } from '../core/services/ticket.service';

interface TicketCheckResult {
  status: 'VALID' | 'INVALID';
  reason: string;
}

@Component({
  selector: 'app-inspector-check-page',
  standalone: true,
  imports: [InspectorCheckFormComponent],
  template: `
    <div class="mx-auto max-w-xl space-y-6">
      <header class="space-y-1">
        <h2 class="text-2xl font-semibold text-slate-900">Weryfikacja biletu</h2>
        <p class="text-sm text-slate-600">
          Sprawdź ważność biletu na podstawie kodu i identyfikatora pojazdu.
        </p>
      </header>

      <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <app-inspector-check-form (submitted)="onFormSubmit($event)" />
      </section>

      @if (result?.status === 'VALID') {
        <section
          class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <p class="font-semibold">Wynik: WAŻNY ({{ result?.status }})</p>
          <p>Powód: {{ result?.reason }}</p>
        </section>
      }

      @if (result?.status === 'INVALID') {
        <section class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <p class="font-semibold">Wynik: NIEWAŻNY ({{ result?.status }})</p>
          <p>Powód: {{ result?.reason }}</p>
        </section>
      }
    </div>
  `,
})
export class InspectorCheckPageComponent {
  private ticketService = inject(TicketService);

  protected result: TicketCheckResult | null = null;

  protected onFormSubmit(formValue: InspectorCheckFormValue): void {
    this.result = null;

    this.ticketService.checkTicket(formValue.ticketCode, formValue.vehicleId).subscribe({
      next: (response) => {
        this.result = response;
      },
      error: (err) => {
        console.error('Błąd podczas weryfikacji', err);
      },
    });
  }
}
