import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  PurchaseFormValue,
  PurchaseOptionsFormComponent,
} from '../components/forms/purchase-options-form.component';

@Component({
  selector: 'app-purchase-page',
  standalone: true,
  imports: [PurchaseOptionsFormComponent],
  template: `
    <div class="mx-auto max-w-2xl space-y-6">
      <header class="space-y-1">
        <h2 class="text-2xl font-semibold text-slate-900">Zakup biletu</h2>
        <p class="text-sm text-slate-600">
          Finalizacja zakupu dla oferty #{{ offerId ?? 'nieznanej' }}.
        </p>
      </header>

      <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="mb-3 text-lg font-medium text-slate-900">Opcje ważności biletu</h3>
        <app-purchase-options-form (submitted)="onFormSubmit($event)" />
      </section>

      @if (lastSubmitted) {
        <section class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p class="font-medium">Formularz zakupu gotowy do wysłania.</p>
          <p>Typ biletu: {{ lastSubmitted.ticketType }}</p>
          @if (lastSubmitted.validFrom) {
            <p>Data rozpoczęcia: {{ lastSubmitted.validFrom }}</p>
          }
        </section>
      }
    </div>
  `,
})
export class PurchasePageComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly offerId = this.route.snapshot.paramMap.get('offerId');
  protected lastSubmitted: PurchaseFormValue | null = null;

  protected onFormSubmit(formValue: PurchaseFormValue): void {
    this.lastSubmitted = formValue;
  }
}
