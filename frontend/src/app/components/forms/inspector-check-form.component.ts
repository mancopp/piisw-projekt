import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface InspectorCheckFormValue {
  ticketCode: string;
  vehicleId: string;
}

@Component({
  selector: 'app-inspector-check-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      @if (submitAttempted && form.invalid) {
        <p class="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Formularz zawiera błędy. Popraw pola i spróbuj ponownie.
        </p>
      }

      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-700">Kod biletu</span>
        <input
          type="text"
          formControlName="ticketCode"
          required
          class="w-full rounded-md border px-3 py-2 font-mono text-sm text-slate-900 outline-none ring-indigo-200 focus:ring-2"
          [class.border-slate-300]="!isInvalid('ticketCode')"
          [class.border-rose-400]="isInvalid('ticketCode')"
          placeholder="TCK-4Q7K8R2M9P"
        />
        @if (isInvalid('ticketCode')) {
          <p class="text-sm text-rose-700">{{ getTicketCodeErrorMessage() }}</p>
        }
      </label>

      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-700">Identyfikator pojazdu</span>
        <input
          type="text"
          formControlName="vehicleId"
          required
          class="w-full rounded-md border px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring-2"
          [class.border-slate-300]="!isInvalid('vehicleId')"
          [class.border-rose-400]="isInvalid('vehicleId')"
          placeholder="KR-105"
        />
        @if (isInvalid('vehicleId')) {
          <p class="text-sm text-rose-700">{{ getVehicleIdErrorMessage() }}</p>
        }
      </label>

      <button
        type="submit"
        class="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Sprawdź bilet
      </button>
    </form>
  `,
})
export class InspectorCheckFormComponent {
  @Output() submitted = new EventEmitter<InspectorCheckFormValue>();
  private readonly formBuilder = inject(FormBuilder);
  protected submitAttempted = false;

  protected readonly form = this.formBuilder.nonNullable.group({
    ticketCode: ['', [Validators.required, Validators.pattern(/^TCK-[A-Z0-9]{10}$/)]],
    vehicleId: ['', [Validators.required, Validators.pattern(/^[A-Z]{2,3}-\d{1,4}$/)]],
  });

  protected submit(): void {
    this.submitAttempted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  protected isInvalid(controlName: 'ticketCode' | 'vehicleId'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitAttempted);
  }

  protected getTicketCodeErrorMessage(): string {
    const ticketCodeControl = this.form.controls.ticketCode;
    if (ticketCodeControl.hasError('required')) {
      return 'Kod biletu jest wymagany.';
    }

    return 'Kod biletu musi mieć format TCK-XXXXXXXXXX.';
  }

  protected getVehicleIdErrorMessage(): string {
    const vehicleIdControl = this.form.controls.vehicleId;
    if (vehicleIdControl.hasError('required')) {
      return 'Identyfikator pojazdu jest wymagany.';
    }

    return 'Identyfikator pojazdu musi mieć format np. KR-105.';
  }
}
