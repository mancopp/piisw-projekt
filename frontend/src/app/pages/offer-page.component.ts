import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChevronRight, ListFilter, LucideAngularModule, Tags } from 'lucide-angular';
import {
  OfferFiltersFormComponent,
  OfferFiltersValue,
} from '../components/forms/offer-filters-form.component';

import { TicketService } from '../core/services/ticket.service';
import { TicketOffer } from '../core/models/ticket.dto';

@Component({
  selector: 'app-offer-page',
  standalone: true,
  imports: [OfferFiltersFormComponent, RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <header class="space-y-1">
        <h2 class="inline-flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <lucide-angular [img]="offerIcon" [size]="22" />
          Oferta biletów
        </h2>
        <p class="text-sm text-slate-600">Wybierz rodzaj biletu i przejdź do zakupu.</p>
      </header>

      <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="mb-3 inline-flex items-center gap-2 text-lg font-medium text-slate-900">
          <lucide-angular [img]="filtersIcon" [size]="18" />
          Filtrowanie
        </h3>
        <app-offer-filters-form (filtersChanged)="onFiltersChanged($event)" />
      </section>

      @if (isLoading()) {
        <section class="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p class="text-sm text-slate-600">Ładowanie dostępnych biletów...</p>
        </section>
      } @else if (loadError()) {
        <section class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm">
          <p class="text-sm text-rose-700">
            Nie udało się pobrać oferty biletów. Spróbuj odświeżyć stronę.
          </p>
        </section>
      } @else if (filteredOffers().length > 0) {
        <section class="grid gap-4 md:grid-cols-2">
          @for (offer of filteredOffers(); track offer.id) {
            <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-3 flex items-start justify-between gap-2">
                <h3 class="font-medium text-slate-900">{{ offer.name }}</h3>
                <p class="text-lg font-semibold text-slate-900">{{ offer.price.toFixed(2) }} PLN</p>
              </div>

              <dl class="mb-4 grid gap-1 text-sm text-slate-600">
                <div class="flex gap-1">
                  <dt class="font-medium text-slate-800">Typ:</dt>
                  <dd>{{ offer.ticketType }}</dd>
                </div>
                <div class="flex gap-1">
                  <dt class="font-medium text-slate-800">Taryfa:</dt>
                  <dd>{{ offer.fareType }}</dd>
                </div>
                @if (offer.durationMinutes) {
                  <div class="flex gap-1">
                    <dt class="font-medium text-slate-800">Czas ważności:</dt>
                    <dd>{{ offer.durationMinutes }} min</dd>
                  </div>
                }
                @if (offer.validityDays) {
                  <div class="flex gap-1">
                    <dt class="font-medium text-slate-800">Okres:</dt>
                    <dd>{{ offer.validityDays }} dni</dd>
                  </div>
                }
              </dl>

              <a
                class="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                [routerLink]="['/offer', offer.id, 'purchase']"
              >
                Kup bilet
                <lucide-angular [img]="buyIcon" [size]="15" />
              </a>
            </article>
          }
        </section>
      } @else {
        <section class="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p class="text-sm text-slate-600">
            Brak dostępnych biletów dla wybranych filtrów. Spróbuj zmienić kryteria wyszukiwania.
          </p>
        </section>
      }
    </div>
  `,
})
export class OfferPageComponent implements OnInit {
  private ticketService = inject(TicketService);

  protected readonly offerIcon = Tags;
  protected readonly filtersIcon = ListFilter;
  protected readonly buyIcon = ChevronRight;
  protected readonly currentFilters = signal<OfferFiltersValue>({
    ticketType: 'ALL',
    fareType: 'ALL',
  });
  protected readonly offers = signal<TicketOffer[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly filteredOffers = computed(() => {
    const filters = this.currentFilters();
    return this.offers().filter((offer) => {
      const matchesTicketType = filters.ticketType === 'ALL' || offer.ticketType === filters.ticketType;
      const matchesFareType = filters.fareType === 'ALL' || offer.fareType === filters.fareType;

      return matchesTicketType && matchesFareType;
    });
  });

  ngOnInit(): void {
    this.ticketService.getOffers().subscribe({
      next: (data) => {
        this.offers.set(data);
        this.loadError.set(null);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loadError.set('FETCH_OFFERS_FAILED');
        this.isLoading.set(false);
      },
    });
  }

  protected onFiltersChanged(filters: OfferFiltersValue): void {
    this.currentFilters.set(filters);
  }
}
