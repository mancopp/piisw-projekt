import { Component } from '@angular/core';
import { RegisterFormComponent, RegisterFormValue } from '../components/forms/register-form.component';

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

      @if (lastSubmittedEmail) {
        <p class="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Konto gotowe do utworzenia dla: {{ lastSubmittedEmail }}
        </p>
      }
    </div>
  `,
})
export class RegisterPageComponent {
  protected lastSubmittedEmail: string | null = null;

  protected onFormSubmit(formValue: RegisterFormValue): void {
    this.lastSubmittedEmail = formValue.email;
  }
}
