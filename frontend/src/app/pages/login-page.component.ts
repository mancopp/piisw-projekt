import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
  private static readonly DEFAULT_LOGIN_ERROR = 'Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.';
  protected errorMessage: string | null = null;
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  protected isLoading = false;

  protected onFormSubmit(formValue: LoginFormValue): void {
    this.errorMessage = null;
    this.isLoading = true;

    this.authService.login({ email: formValue.email, password: formValue.password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.markForCheck();

        if (response.role === 'INSPECTOR') {
          this.router.navigate(['/inspector/check']);
        } else {
          this.router.navigate(['/offer']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.resolveErrorMessage(err);
        this.cdr.markForCheck();
        console.error('Wystapił bład podczas logowania', err);
      }
    });
  }

  private resolveErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return LoginPageComponent.DEFAULT_LOGIN_ERROR;
    }

    if (error.status === 0) {
      return 'Brak połączenia z serwerem. Spróbuj ponownie później.';
    }

    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error;
    }

    if (error.error && typeof error.error === 'object') {
      const backendError = error.error as { message?: unknown; path?: unknown };
      if (typeof backendError.message === 'string' && backendError.message.trim().length > 0) {
        return backendError.message;
      }

      if (error.status === 404 && typeof backendError.path === 'string' && backendError.path.length > 0) {
        return 'Usługa logowania jest niedostępna. Spróbuj ponownie później.';
      }
    }

    return LoginPageComponent.DEFAULT_LOGIN_ERROR;
  }
}
