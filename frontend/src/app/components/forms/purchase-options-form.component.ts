import { Component, EventEmitter, Output, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

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
      @if (submitAttempted && form.invalid) {
        <p class="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Formularz zawiera błędy. Popraw pola i spróbuj ponownie.
        </p>
      }

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
  protected submitAttempted = false;

  protected readonly form = this.formBuilder.nonNullable.group(
    {
      ticketType: ['TIME' as PurchaseTicketType, [Validators.required]],
      validFrom: [''],
    },
    { validators: periodTicketRequiresStartDate },
  );

  protected submit(): void {
    this.submitAttempted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  protected get isValidFromInvalid(): boolean {
    const validFromControl = this.form.controls.validFrom;
    return (
      this.form.hasError('periodStartDateRequired') &&
      (validFromControl.touched || this.submitAttempted)
    );
  }
}

function periodTicketRequiresStartDate(control: AbstractControl): ValidationErrors | null {
  const ticketType = control.get('ticketType')?.value as PurchaseTicketType | undefined;
  const validFrom = control.get('validFrom')?.value as string | undefined;

  if (ticketType !== 'PERIOD') {
    return null;
  }

  if (typeof validFrom === 'string' && validFrom.trim().length > 0) {
    return null;
  }

  return { periodStartDateRequired: true };
}
