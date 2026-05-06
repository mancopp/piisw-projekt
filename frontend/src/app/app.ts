import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideAngularModule,
  QrCode,
  Receipt,
  ShieldCheck,
  Tags,
  Ticket,
} from 'lucide-angular';
import { AuthResponse } from './core/models/auth.dto';
import { AuthService } from './core/services/auth.service';

interface NavigationLink {
  route: string;
  label: string;
  icon: typeof Tags;
}

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly offerIcon = Tags;
  protected readonly myTicketsIcon = Ticket;
  protected readonly transactionsIcon = Receipt;
  protected readonly checkIcon = ShieldCheck;
  protected readonly titleIcon = QrCode;

  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly passengerLinks: NavigationLink[] = [
    { route: '/offer', label: 'Oferta', icon: this.offerIcon },
    { route: '/my-tickets', label: 'Moje bilety', icon: this.myTicketsIcon },
    { route: '/transactions', label: 'Transakcje', icon: this.transactionsIcon },
  ];

  protected readonly inspectorLinks: NavigationLink[] = [
    { route: '/inspector/check', label: 'Weryfikacja', icon: this.checkIcon },
  ];

  protected get roleLabel(): string {
    const role = this.authService.getRole();
    return role === 'INSPECTOR' ? 'Bileter' : 'Pasażer';
  }

  protected get currentUserEmail(): string {
    return this.authService.getUserEmail() ?? 'Brak danych';
  }

  protected get currentLinks(): NavigationLink[] {
    const role: AuthResponse['role'] | null = this.authService.getRole();
    if (role === 'INSPECTOR') {
      return this.inspectorLinks;
    }

    if (role === 'PASSENGER') {
      return this.passengerLinks;
    }

    return [];
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
