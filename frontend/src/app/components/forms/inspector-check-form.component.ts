import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

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
      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-700">Kod biletu</span>
        <input
          type="text"
          formControlName="ticketCode"
          required
          class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 outline-none ring-indigo-200 focus:ring-2"
          placeholder="TCK-4Q7K8R2M9P"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-700">Identyfikator pojazdu</span>
        <input
          type="text"
          formControlName="vehicleId"
          required
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring-2"
          placeholder="KR-105"
        />
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

  protected readonly form = this.formBuilder.nonNullable.group({
    ticketCode: '',
    vehicleId: '',
  });

  protected submit(): void {
    this.submitted.emit(this.form.getRawValue());
  }
}
