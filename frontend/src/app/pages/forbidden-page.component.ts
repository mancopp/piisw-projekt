import { Component } from '@angular/core';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  template: `
    <h2>Brak dostępu</h2>
    <p>Nie masz uprawnień do tej sekcji.</p>
  `,
})
export class ForbiddenPageComponent {}
