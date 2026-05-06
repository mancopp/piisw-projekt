import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LogIn,
  LucideAngularModule,
  QrCode,
  Receipt,
  ShieldCheck,
  Tags,
  Ticket,
  UserPlus,
} from 'lucide-angular';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly loginIcon = LogIn;
  protected readonly registerIcon = UserPlus;
  protected readonly offerIcon = Tags;
  protected readonly myTicketsIcon = Ticket;
  protected readonly transactionsIcon = Receipt;
  protected readonly checkIcon = ShieldCheck;
  protected readonly titleIcon = QrCode;
}
