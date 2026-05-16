import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterFormComponent, RegisterFormValue } from '../components/forms/register-form.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RegisterFormComponent],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header class="space-y-1">
        <h2 class="text-2xl font-semibold text-slate-900">Rejestracja</h2>
        <p class="text-sm text-slate-600">
          Załóż konto pasażera, aby kupować i przeglądać bilety.
        </p>
      </header>

      <app-register-form (submitted)="onFormSubmit($event)" />

      @if (errorMessage) {
        <p class="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {{ errorMessage }}
        </p>
      }

      @if (lastSubmittedEmail) {
        <p class="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Konto gotowe do utworzenia dla: {{ lastSubmittedEmail }}
        </p>
      }
    </div>
  `,
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected lastSubmittedEmail: string | null = null;
  protected errorMessage: string | null = null;

  protected onFormSubmit(formValue: RegisterFormValue): void {
    this.errorMessage = null;
    this.authService.register({ email: formValue.email, password: formValue.password }).subscribe({
      next: () => {
        this.lastSubmittedEmail = formValue.email;
        this.router.navigate(['/offer']);
      },
      error: (err) => {
        this.errorMessage = 'Nie udało się utworzyć konta. Sprawdź dane i spróbuj ponownie.';
        console.error('Wystąpił błąd podczas rejestracji', err);
      },
    });
  }
}
