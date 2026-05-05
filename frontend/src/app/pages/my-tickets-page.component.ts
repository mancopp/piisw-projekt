import { Component } from '@angular/core';

interface MyTicketView {
  code: string;
  ticketType: 'SINGLE' | 'TIME' | 'PERIOD';
  status: 'PURCHASED' | 'ACTIVATED' | 'EXPIRED';
  validFrom: string | null;
  validTo: string | null;
  activatedVehicleId: string | null;
}

@Component({
  selector: 'app-my-tickets-page',
  standalone: true,
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
                    {{ ticket.validFrom }} - {{ ticket.validTo }}
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
export class MyTicketsPageComponent {
  protected readonly tickets: MyTicketView[] = [
    {
      code: 'TCK-4Q7K8R2M9P',
      ticketType: 'TIME',
      status: 'ACTIVATED',
      validFrom: '2026-05-04 17:10',
      validTo: '2026-05-04 17:30',
      activatedVehicleId: 'KR-105',
    },
    {
      code: 'TCK-L3M2N7P4Q8',
      ticketType: 'PERIOD',
      status: 'PURCHASED',
      validFrom: '2026-05-10 00:00',
      validTo: '2026-06-09 23:59',
      activatedVehicleId: null,
    },
  ];
}
