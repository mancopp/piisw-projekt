import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type PurchaseTicketType = 'SINGLE' | 'TIME' | 'PERIOD';

export interface PurchaseFormValue {
  validFrom: string | null;
}

@Component({
  selector: 'app-purchase-options-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      @if (submitAttempted && form.invalid) {
        <p class="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Formularz zawiera błędy. Popraw pola i spróbuj ponownie.
        </p>
      }

      <p class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        Typ biletu z oferty: <span class="font-medium">{{ ticketTypeLabel }}</span>
      </p>

      @if (requiresStartDate) {
        <label class="block space-y-1">
          <span class="text-sm font-medium text-slate-700">Data rozpoczęcia</span>
          <input
            type="date"
            formControlName="validFrom"
            class="w-full rounded-md border px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring-2"
            [class.border-slate-300]="!isValidFromInvalid"
            [class.border-rose-400]="isValidFromInvalid"
          />
          @if (isValidFromInvalid) {
            <p class="text-sm text-rose-700">
              Dla biletu okresowego data rozpoczęcia jest wymagana.
            </p>
          }
        </label>
      } @else {
        <p class="text-sm text-slate-600">Ten typ biletu nie wymaga daty rozpoczęcia przy zakupie.</p>
      }

      <button
        type="submit"
        class="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Potwierdź zakup
      </button>
    </form>
  `,
})
export class PurchaseOptionsFormComponent implements OnChanges {
  @Input() ticketType: PurchaseTicketType | null = null;
  @Output() submitted = new EventEmitter<PurchaseFormValue>();
  private readonly formBuilder = inject(FormBuilder);
  protected submitAttempted = false;

  protected readonly form = this.formBuilder.nonNullable.group({
    validFrom: [''],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['ticketType']) {
      return;
    }

    const validFromControl = this.form.controls.validFrom;
    if (this.ticketType === 'PERIOD') {
      validFromControl.setValidators([Validators.required]);
    } else {
      validFromControl.clearValidators();
      validFromControl.setValue('');
      validFromControl.markAsPristine();
      validFromControl.markAsUntouched();
    }
    validFromControl.updateValueAndValidity();
  }

  protected submit(): void {
    this.submitAttempted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValidFrom = this.form.controls.validFrom.getRawValue().trim();
    this.submitted.emit({
      validFrom: rawValidFrom.length > 0 ? rawValidFrom : null,
    });
  }

  protected get isValidFromInvalid(): boolean {
    const validFromControl = this.form.controls.validFrom;
    return this.ticketType === 'PERIOD' && validFromControl.invalid && (validFromControl.touched || this.submitAttempted);
  }

  protected get ticketTypeLabel(): string {
    if (this.ticketType === 'SINGLE') {
      return 'Jednorazowy';
    }
    if (this.ticketType === 'TIME') {
      return 'Czasowy';
    }
    if (this.ticketType === 'PERIOD') {
      return 'Okresowy';
    }
    return 'Nieznany';
  }

  protected get requiresStartDate(): boolean {
    return this.ticketType === 'PERIOD';
  }
}
