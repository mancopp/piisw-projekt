import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import {
  PurchaseFormValue,
  PurchaseOptionsFormComponent,
} from '../components/forms/purchase-options-form.component';
import { TicketOffer } from '../core/models/ticket.dto';
import { TicketService } from '../core/services/ticket.service';

@Component({
  selector: 'app-purchase-page',
  standalone: true,
  imports: [PurchaseOptionsFormComponent],
  template: `
    <div class="mx-auto max-w-2xl space-y-6">
      <header class="space-y-1">
        <h2 class="text-2xl font-semibold text-slate-900">Zakup biletu</h2>
        <p class="text-sm text-slate-600">Finalizacja zakupu dla oferty #{{ offerId }}.</p>
      </header>

      @if (selectedOffer) {
        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="mb-3 text-lg font-medium text-slate-900">Wybrana oferta</h3>
          <dl class="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <div class="flex gap-1">
              <dt class="font-medium text-slate-900">Nazwa:</dt>
              <dd>{{ selectedOffer.name }}</dd>
            </div>
            <div class="flex gap-1">
              <dt class="font-medium text-slate-900">Typ:</dt>
              <dd>{{ selectedOffer.ticketType }}</dd>
            </div>
            <div class="flex gap-1">
              <dt class="font-medium text-slate-900">Taryfa:</dt>
              <dd>{{ selectedOffer.fareType }}</dd>
            </div>
            <div class="flex gap-1">
              <dt class="font-medium text-slate-900">Cena:</dt>
              <dd>{{ selectedOffer.price.toFixed(2) }} PLN</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="mb-3 text-lg font-medium text-slate-900">Opcje ważności biletu</h3>
          <app-purchase-options-form
            [ticketType]="selectedOffer.ticketType"
            (submitted)="onFormSubmit($event)"
          />
        </section>
      } @else {
        <section class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Nie znaleziono oferty o podanym identyfikatorze.
        </section>
      }

      @if (lastSubmitted) {
        <section class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p class="font-medium">Formularz zakupu gotowy do wysłania.</p>
          @if (lastSubmitted.validFrom) {
            <p>Data rozpoczęcia: {{ lastSubmitted.validFrom }}</p>
          } @else {
            <p>Brak dodatkowych danych wymaganych dla tego typu biletu.</p>
          }
        </section>
      }

      @if (purchaseError) {
        <section class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {{ purchaseError }}
        </section>
      }
    </div>
  `,
})
export class PurchasePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ticketService = inject(TicketService);
  protected readonly offerId = Number(this.route.snapshot.paramMap.get('offerId'));
  protected selectedOffer: TicketOffer | null = null;
  protected lastSubmitted: PurchaseFormValue | null = null;
  protected purchaseError: string | null = null;

  ngOnInit(): void {
    if (!Number.isInteger(this.offerId) || this.offerId <= 0) {
      return;
    }

    this.ticketService.getOffers().subscribe({
      next: (offers) => {
        this.selectedOffer = offers.find((offer) => offer.id === this.offerId) ?? null;
      },
      error: (err) => {
        console.error('Błąd pobierania oferty biletu', err);
      },
    });
  }

  protected onFormSubmit(formValue: PurchaseFormValue): void {
    this.lastSubmitted = formValue;
    this.purchaseError = null;
    this.ticketService.purchaseTicket(this.offerId, formValue.validFrom).subscribe({
      next: (response) => {
        this.router.navigate(['/my-tickets', response.ticketId]);
      },
      error: (err) => {
        this.purchaseError = 'Nie udało się zrealizować zakupu. Spróbuj ponownie.';
        console.error('Błąd podczas zakupu biletu', err);
      },
    });
  }
}
