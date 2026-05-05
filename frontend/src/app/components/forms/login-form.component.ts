import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

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
      @if (submitAttempted && form.invalid) {
        <p class="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Formularz zawiera błędy. Popraw pola i spróbuj ponownie.
        </p>
      }

      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-700">Email</span>
        <input
          type="email"
          formControlName="email"
          required
          class="w-full rounded-md border px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring-2"
          [class.border-slate-300]="!isInvalid('email')"
          [class.border-rose-400]="isInvalid('email')"
          placeholder="user@example.com"
        />
        @if (isInvalid('email')) {
          <p class="text-sm text-rose-700">{{ getEmailErrorMessage() }}</p>
        }
      </label>

      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-700">Hasło</span>
        <input
          type="password"
          formControlName="password"
          required
          class="w-full rounded-md border px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring-2"
          [class.border-slate-300]="!isInvalid('password')"
          [class.border-rose-400]="isInvalid('password')"
          placeholder="••••••••"
        />
        @if (isInvalid('password')) {
          <p class="text-sm text-rose-700">{{ getPasswordErrorMessage() }}</p>
        }
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
  protected submitAttempted = false;

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    this.submitAttempted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  protected isInvalid(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitAttempted);
  }

  protected getEmailErrorMessage(): string {
    const emailControl = this.form.controls.email;
    if (emailControl.hasError('required')) {
      return 'Email jest wymagany.';
    }

    return 'Podaj poprawny adres email.';
  }

  protected getPasswordErrorMessage(): string {
    const passwordControl = this.form.controls.password;
    if (passwordControl.hasError('required')) {
      return 'Hasło jest wymagane.';
    }

    return 'Hasło musi mieć co najmniej 8 znaków.';
  }
}
