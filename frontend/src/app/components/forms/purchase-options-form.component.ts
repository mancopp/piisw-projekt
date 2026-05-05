import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

type PurchaseTicketType = 'SINGLE' | 'TIME' | 'PERIOD';

export interface PurchaseFormValue {
  ticketType: PurchaseTicketType;
  validFrom: string;
}

@Component({
  selector: 'app-purchase-options-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <fieldset class="space-y-2">
        <legend class="text-sm font-medium text-slate-700">Typ biletu</legend>

        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input type="radio" formControlName="ticketType" value="SINGLE" />
          Jednorazowy (aktywacja przy kasowaniu)
        </label>

        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input type="radio" formControlName="ticketType" value="TIME" />
          Czasowy (okres liczony od aktywacji)
        </label>

        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input type="radio" formControlName="ticketType" value="PERIOD" />
          Okresowy (wymaga daty rozpoczęcia)
        </label>
      </fieldset>

      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-700">Data rozpoczęcia (dla okresowego)</span>
        <input
          type="date"
          formControlName="validFrom"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring-2"
        />
      </label>

      <button
        type="submit"
        class="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Potwierdź zakup
      </button>
    </form>
  `,
})
export class PurchaseOptionsFormComponent {
  @Output() submitted = new EventEmitter<PurchaseFormValue>();
  private readonly formBuilder = inject(FormBuilder);

  protected readonly form = this.formBuilder.nonNullable.group({
    ticketType: 'TIME' as PurchaseTicketType,
    validFrom: '',
  });

  protected submit(): void {
    this.submitted.emit(this.form.getRawValue());
  }
}
