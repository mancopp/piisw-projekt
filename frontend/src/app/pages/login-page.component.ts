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

      @if (lastSubmitted) {
        <p class="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Dane formularza gotowe do wysłania: {{ lastSubmitted.email }}
        </p>
      }
    </div>
  `,
})
export class LoginPageComponent {
  protected lastSubmitted: LoginFormValue | null = null;
  private authService = inject(AuthService);
  private router = inject(Router);

  protected isLoading = false;

  protected onFormSubmit(formValue: LoginFormValue): void {
    this.lastSubmitted = formValue;
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
        console.error('Wystapił bład podczas logowania', err);
      }
    });
  }
}
