import { ActivatedRoute, Routes } from '@angular/router';
import { ForbiddenPageComponent } from './pages/forbidden-page.component';
import { InspectorCheckPageComponent } from './pages/inspector-check-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { MyTicketsPageComponent } from './pages/my-tickets-page.component';
import { NotFoundPageComponent } from './pages/not-found-page.component';
import { OfferPageComponent } from './pages/offer-page.component';
import { PurchasePageComponent } from './pages/purchase-page.component';
import { RegisterPageComponent } from './pages/register-page.component';
import { TransactionsPageComponent } from './pages/transactions-page.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },

  {
    path: 'offer',
    component: OfferPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'PASSENGER' },
  },
  {
    path: 'offer/:offerId/purchase',
    component: PurchasePageComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'PASSENGER' },
  },
  {
    path: 'my-tickets',
    component: MyTicketsPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'PASSENGER' },
  },
  {
    path: 'transactions',
    component: TransactionsPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'PASSENGER' },
  },
  {
    path: 'inspector/check',
    component: InspectorCheckPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'INSPECTOR' },
  },
  {
    path: 'forbidden',
    component: ForbiddenPageComponent,
    canActivate: [authGuard]
  },
  { path: 'not-found', component: NotFoundPageComponent },
  { path: '**', redirectTo: 'not-found' },
];
