import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  template: `
    <h2>Nie znaleziono strony</h2>
    <p>Podana ścieżka nie istnieje.</p>
  `,
})
export class NotFoundPageComponent {}
