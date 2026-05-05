import { Component, EventEmitter, Output, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

export interface RegisterFormValue {
  email: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-register-form',
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
          placeholder="Minimum 8 znaków"
        />
        @if (isInvalid('password')) {
          <p class="text-sm text-rose-700">{{ getPasswordErrorMessage() }}</p>
        }
      </label>

      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-700">Potwierdzenie hasła</span>
        <input
          type="password"
          formControlName="confirmPassword"
          required
          class="w-full rounded-md border px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring-2"
          [class.border-slate-300]="!isInvalid('confirmPassword')"
          [class.border-rose-400]="isInvalid('confirmPassword')"
          placeholder="Powtórz hasło"
        />
        @if (isInvalid('confirmPassword')) {
          <p class="text-sm text-rose-700">{{ getConfirmPasswordErrorMessage() }}</p>
        }
      </label>

      <button
        type="submit"
        class="inline-flex w-full justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Załóż konto
      </button>
    </form>
  `,
})
export class RegisterFormComponent {
  @Output() submitted = new EventEmitter<RegisterFormValue>();
  private readonly formBuilder = inject(FormBuilder);
  protected submitAttempted = false;

  protected readonly form = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  protected submit(): void {
    this.submitAttempted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  protected isInvalid(controlName: 'email' | 'password' | 'confirmPassword'): boolean {
    const control = this.form.controls[controlName];
    if (controlName === 'confirmPassword' && this.form.hasError('passwordMismatch')) {
      return control.touched || this.submitAttempted;
    }

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

    if (passwordControl.hasError('minlength')) {
      return 'Hasło musi mieć co najmniej 8 znaków.';
    }

    return 'Hasło musi zawierać małą literę, wielką literę i cyfrę.';
  }

  protected getConfirmPasswordErrorMessage(): string {
    const confirmPasswordControl = this.form.controls.confirmPassword;
    if (confirmPasswordControl.hasError('required')) {
      return 'Potwierdzenie hasła jest wymagane.';
    }

    if (this.form.hasError('passwordMismatch')) {
      return 'Hasła muszą być takie same.';
    }

    return 'Hasła muszą być takie same.';
  }
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password === confirmPassword) {
    return null;
  }

  return { passwordMismatch: true };
}
