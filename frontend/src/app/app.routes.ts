import { Routes } from '@angular/router';
import { ForbiddenPageComponent } from './pages/forbidden-page.component';
import { InspectorCheckPageComponent } from './pages/inspector-check-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { MyTicketsPageComponent } from './pages/my-tickets-page.component';
import { NotFoundPageComponent } from './pages/not-found-page.component';
import { OfferPageComponent } from './pages/offer-page.component';
import { PurchasePageComponent } from './pages/purchase-page.component';
import { RegisterPageComponent } from './pages/register-page.component';
import { TransactionsPageComponent } from './pages/transactions-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'offer', component: OfferPageComponent },
  { path: 'offer/:offerId/purchase', component: PurchasePageComponent },
  { path: 'my-tickets', component: MyTicketsPageComponent },
  { path: 'transactions', component: TransactionsPageComponent },
  { path: 'inspector/check', component: InspectorCheckPageComponent },
  { path: 'forbidden', component: ForbiddenPageComponent },
  { path: 'not-found', component: NotFoundPageComponent },
  { path: '**', redirectTo: 'not-found' },
];
