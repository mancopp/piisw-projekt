import { Component, inject } from '@angular/core';
import { LoginFormComponent, LoginFormValue } from '../components/forms/login-form.component';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginFormComponent],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header class="space-y-1">
        <h2 class="text-2xl font-semibold text-slate-900">Logowanie</h2>
        <p class="text-sm text-slate-600">Zaloguj się, aby przejść do swojej strefy biletów.</p>
      </header>

      <app-login-form (submitted)="onFormSubmit($event)" />

      @if (errorMessage) {
        <p class="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {{ errorMessage }}
        </p>
      }

    </div>
  `,
})
export class LoginPageComponent {
  protected errorMessage: string | null = null;
  private authService = inject(AuthService);
  private router = inject(Router);

  protected isLoading = false;

  protected onFormSubmit(formValue: LoginFormValue): void {
    this.errorMessage = null;
    this.isLoading = true;

    this.authService.login({ email: formValue.email, password: formValue.password }).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.role === 'INSPECTOR') {
          this.router.navigate(['/inspector/check']);
        } else {
          this.router.navigate(['/offer']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.';
        console.error('Wystapił bład podczas logowania', err);
      }
    });
  }
}
