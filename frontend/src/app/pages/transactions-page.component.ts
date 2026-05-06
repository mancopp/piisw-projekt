import { Component } from '@angular/core';
import { LucideAngularModule, Receipt } from 'lucide-angular';

interface TransactionView {
  id: number;
  ticketCode: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED';
  createdAt: string;
}

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="space-y-6">
      <header class="space-y-1">
        <h2 class="inline-flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <lucide-angular [img]="receiptIcon" [size]="24" class="text-indigo-600" />
          Historia transakcji
        </h2>
        <p class="text-sm text-slate-600">Przegląd operacji zakupu biletów.</p>
      </header>

      @if (transactions.length > 0) {
        <div
          class="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left font-medium text-slate-700">
              <tr>
                <th class="px-4 py-3">ID</th>
                <th class="px-4 py-3">Bilet</th>
                <th class="px-4 py-3">Kwota</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (transaction of transactions; track transaction.id) {
                <tr class="text-slate-700 transition hover:bg-slate-50">
                  <td class="px-4 py-3 font-medium">{{ transaction.id }}</td>
                  <td class="px-4 py-3 font-mono text-xs">{{ transaction.ticketCode }}</td>
                  <td class="px-4 py-3 font-medium text-slate-900">
                    {{ transaction.amount.toFixed(2) }} PLN
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200"
                    >
                      {{ transaction.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-500">{{ transaction.createdAt }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="grid gap-4 md:hidden">
          @for (transaction of transactions; track transaction.id) {
            <div
              class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <span class="text-sm font-semibold text-slate-900">ID: {{ transaction.id }}</span>
                <span
                  class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200"
                >
                  {{ transaction.status }}
                </span>
              </div>

              <div class="space-y-1">
                <div class="flex justify-between">
                  <span class="text-sm text-slate-500">Bilet</span>
                  <span class="font-mono text-xs text-slate-700">{{ transaction.ticketCode }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-500">Data</span>
                  <span class="text-sm text-slate-700">{{ transaction.createdAt }}</span>
                </div>
              </div>

              <div class="mt-1 flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span class="text-sm font-medium text-slate-700">Kwota</span>
                <span class="font-bold text-slate-900"
                  >{{ transaction.amount.toFixed(2) }} PLN</span
                >
              </div>
            </div>
          }
        </div>
      } @else {
        <section
          class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 px-4 text-center"
        >
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/50 text-slate-500"
          >
            <lucide-angular [img]="receiptIcon" [size]="32" />
          </div>
          <h3 class="mt-2 text-lg font-semibold text-slate-900">Brak historii transakcji</h3>
          <p class="mt-2 max-w-sm text-sm text-slate-500">
            Wygląda na to, że nie kupiłeś jeszcze żadnego biletu. Twoje przyszłe płatności i
            paragony pojawią się w tym miejscu.
          </p>
        </section>
      }
    </div>
  `,
})
export class TransactionsPageComponent {
  protected readonly receiptIcon = Receipt;

  protected readonly transactions: TransactionView[] = [
    {
      id: 6001,
      ticketCode: 'TCK-4Q7K8R2M9P',
      amount: 4.6,
      status: 'SUCCESS',
      createdAt: '2026-05-04 17:00',
    },
    {
      id: 6002,
      ticketCode: 'TCK-L3M2N7P4Q8',
      amount: 49.0,
      status: 'SUCCESS',
      createdAt: '2026-05-05 08:12',
    },
  ];
}
