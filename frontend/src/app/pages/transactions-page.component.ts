import { Component } from '@angular/core';

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
  template: `
    <div class="space-y-4">
      <header class="space-y-1">
        <h2 class="text-2xl font-semibold text-slate-900">Historia transakcji</h2>
        <p class="text-sm text-slate-600">Przegląd operacji zakupu biletów.</p>
      </header>

      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
              <tr class="text-slate-700">
                <td class="px-4 py-3">{{ transaction.id }}</td>
                <td class="px-4 py-3 font-mono text-xs">{{ transaction.ticketCode }}</td>
                <td class="px-4 py-3">{{ transaction.amount.toFixed(2) }} PLN</td>
                <td class="px-4 py-3">{{ transaction.status }}</td>
                <td class="px-4 py-3">{{ transaction.createdAt }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class TransactionsPageComponent {
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
