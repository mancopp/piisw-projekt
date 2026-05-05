import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  OfferFiltersFormComponent,
  OfferFiltersValue,
  TicketFareTypeFilter,
  TicketTypeFilter,
} from '../components/forms/offer-filters-form.component';

type TicketType = Exclude<TicketTypeFilter, 'ALL'>;
type FareType = Exclude<TicketFareTypeFilter, 'ALL'>;

interface TicketOfferView {
  id: number;
  name: string;
  ticketType: TicketType;
  fareType: FareType;
  durationMinutes: number | null;
  validityDays: number | null;
  price: number;
}

@Component({
  selector: 'app-offer-page',
  standalone: true,
  imports: [OfferFiltersFormComponent, RouterLink],
  template: `
    <div class="space-y-6">
      <header class="space-y-1">
        <h2 class="text-2xl font-semibold text-slate-900">Oferta biletów</h2>
        <p class="text-sm text-slate-600">Wybierz rodzaj biletu i przejdź do zakupu.</p>
      </header>

      <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="mb-3 text-lg font-medium text-slate-900">Filtrowanie</h3>
        <app-offer-filters-form (filtersChanged)="onFiltersChanged($event)" />
      </section>

      <section class="grid gap-4 md:grid-cols-2">
        @for (offer of filteredOffers; track offer.id) {
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
              class="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              [routerLink]="['/offer', offer.id, 'purchase']"
            >
              Kup bilet
            </a>
          </article>
        }
      </section>
    </div>
  `,
})
export class OfferPageComponent {
  protected currentFilters: OfferFiltersValue = {
    ticketType: 'ALL',
    fareType: 'ALL',
  };

  protected readonly offers: TicketOfferView[] = [
    {
      id: 1,
      name: 'Bilet jednorazowy normalny',
      ticketType: 'SINGLE',
      fareType: 'NORMAL',
      durationMinutes: null,
      validityDays: null,
      price: 6.0,
    },
    {
      id: 2,
      name: 'Bilet czasowy 20 min normalny',
      ticketType: 'TIME',
      fareType: 'NORMAL',
      durationMinutes: 20,
      validityDays: null,
      price: 4.6,
    },
    {
      id: 3,
      name: 'Bilet okresowy 30 dni ulgowy',
      ticketType: 'PERIOD',
      fareType: 'REDUCED',
      durationMinutes: null,
      validityDays: 30,
      price: 49.0,
    },
  ];

  protected get filteredOffers(): TicketOfferView[] {
    return this.offers.filter((offer) => {
      const matchesTicketType =
        this.currentFilters.ticketType === 'ALL' || offer.ticketType === this.currentFilters.ticketType;
      const matchesFareType =
        this.currentFilters.fareType === 'ALL' || offer.fareType === this.currentFilters.fareType;

      return matchesTicketType && matchesFareType;
    });
  }

  protected onFiltersChanged(filters: OfferFiltersValue): void {
    this.currentFilters = filters;
  }
}
