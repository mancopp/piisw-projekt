import { Component, OnInit, computed, inject, signal } from '@angular/core';
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

      @if (isLoadingOffer()) {
        <section class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Ładowanie danych oferty...
        </section>
      } @else if (offerLoadError()) {
        <section class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Nie udało się pobrać danych oferty. Spróbuj odświeżyć stronę.
        </section>
      } @else if (selectedOffer(); as offer) {
        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="mb-3 text-lg font-medium text-slate-900">Wybrana oferta</h3>
          <dl class="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <div class="flex gap-1">
              <dt class="font-medium text-slate-900">Nazwa:</dt>
              <dd>{{ offer.name }}</dd>
            </div>
            <div class="flex gap-1">
              <dt class="font-medium text-slate-900">Typ:</dt>
              <dd>{{ offer.ticketType }}</dd>
            </div>
            <div class="flex gap-1">
              <dt class="font-medium text-slate-900">Taryfa:</dt>
              <dd>{{ offer.fareType }}</dd>
            </div>
            <div class="flex gap-1">
              <dt class="font-medium text-slate-900">Cena:</dt>
              <dd>{{ offer.price.toFixed(2) }} PLN</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="mb-3 text-lg font-medium text-slate-900">Opcje ważności biletu</h3>
          <app-purchase-options-form [ticketType]="offer.ticketType" (submitted)="onFormSubmit($event)" />
        </section>
      } @else {
        <section class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Nie znaleziono oferty o podanym identyfikatorze.
        </section>
      }

      @if (lastSubmitted(); as submitted) {
        <section class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p class="font-medium">Formularz zakupu gotowy do wysłania.</p>
          @if (submitted.validFrom) {
            <p>Data rozpoczęcia: {{ submitted.validFrom }}</p>
          } @else {
            <p>Brak dodatkowych danych wymaganych dla tego typu biletu.</p>
          }
        </section>
      }

      @if (purchaseError()) {
        <section class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {{ purchaseError() }}
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
  protected readonly offers = signal<TicketOffer[]>([]);
  protected readonly isLoadingOffer = signal(true);
  protected readonly offerLoadError = signal<string | null>(null);
  protected readonly selectedOffer = computed(
    () => this.offers().find((offer) => offer.id === this.offerId) ?? null,
  );
  protected readonly lastSubmitted = signal<PurchaseFormValue | null>(null);
  protected readonly purchaseError = signal<string | null>(null);

  ngOnInit(): void {
    if (!Number.isInteger(this.offerId) || this.offerId <= 0) {
      this.isLoadingOffer.set(false);
      return;
    }

    this.ticketService.getOffers().subscribe({
      next: (offers) => {
        this.offers.set(offers);
        this.offerLoadError.set(null);
        this.isLoadingOffer.set(false);
      },
      error: (err) => {
        console.error('Błąd pobierania oferty biletu', err);
        this.offerLoadError.set('FETCH_OFFER_FAILED');
        this.isLoadingOffer.set(false);
      },
    });
  }

  protected onFormSubmit(formValue: PurchaseFormValue): void {
    this.lastSubmitted.set(formValue);
    this.purchaseError.set(null);
    this.ticketService.purchaseTicket(this.offerId, formValue.validFrom).subscribe({
      next: (response) => {
        this.router.navigate(['/my-tickets', response.ticketId]);
      },
      error: (err) => {
        this.purchaseError.set('Nie udało się zrealizować zakupu. Spróbuj ponownie.');
        console.error('Błąd podczas zakupu biletu', err);
      },
    });
  }
}
