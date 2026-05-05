import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

export interface LoginFormValue {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-700">Email</span>
        <input
          type="email"
          formControlName="email"
          required
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring-2"
          placeholder="user@example.com"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-700">Hasło</span>
        <input
          type="password"
          formControlName="password"
          required
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring-2"
          placeholder="••••••••"
        />
      </label>

      <button
        type="submit"
        class="inline-flex w-full justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Zaloguj
      </button>
    </form>
  `,
})
export class LoginFormComponent {
  @Output() submitted = new EventEmitter<LoginFormValue>();
  private readonly formBuilder = inject(FormBuilder);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: '',
    password: '',
  });

  protected submit(): void {
    this.submitted.emit(this.form.getRawValue());
  }
}
