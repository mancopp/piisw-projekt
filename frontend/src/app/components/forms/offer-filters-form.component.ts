import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

export type TicketTypeFilter = 'ALL' | 'SINGLE' | 'TIME' | 'PERIOD';
export type TicketFareTypeFilter = 'ALL' | 'NORMAL' | 'REDUCED';

export interface OfferFiltersValue {
  ticketType: TicketTypeFilter;
  fareType: TicketFareTypeFilter;
}

@Component({
  selector: 'app-offer-filters-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" class="grid gap-4 sm:grid-cols-2">
      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-700">Typ biletu</span>
        <select
          formControlName="ticketType"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring-2"
        >
          <option value="ALL">Wszystkie</option>
          <option value="SINGLE">Jednorazowy</option>
          <option value="TIME">Czasowy</option>
          <option value="PERIOD">Okresowy</option>
        </select>
      </label>

      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-700">Taryfa</span>
        <select
          formControlName="fareType"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring-2"
        >
          <option value="ALL">Wszystkie</option>
          <option value="NORMAL">Normalny</option>
          <option value="REDUCED">Ulgowy</option>
        </select>
      </label>
    </form>
  `,
})
export class OfferFiltersFormComponent {
  @Output() filtersChanged = new EventEmitter<OfferFiltersValue>();
  private readonly formBuilder = inject(FormBuilder);

  protected readonly form = this.formBuilder.nonNullable.group({
    ticketType: 'ALL' as TicketTypeFilter,
    fareType: 'ALL' as TicketFareTypeFilter,
  });

  constructor() {
    this.form.valueChanges.subscribe((value) => {
      this.filtersChanged.emit({
        ticketType: value.ticketType ?? 'ALL',
        fareType: value.fareType ?? 'ALL',
      });
    });
  }
}
