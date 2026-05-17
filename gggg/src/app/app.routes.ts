import { Routes } from '@angular/router';
import { Trade } from './trade/trade';
import { Holdings } from './holdings';
import { holding } from './holding/holding';
import { SignupComponent } from './signup-component/signup-component';
import { AuthGuard } from './auth-guard';
import { Login } from './login/login';
import { controlauthGuard } from './controlauth-guard';
import { dashboard } from './dashboard/dashboard';
import { summary } from './summary/sumary';

export const routes: Routes = [

  {
    path: '',
    component: Login,
    data: { hideNavbar: true }
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'dashboard',
    component:dashboard,
    canActivate: [AuthGuard]
  },
  {
    path: 'trade',
    component: Trade,
    canActivate: [AuthGuard, controlauthGuard]

  },
  {
    path: 'summary',
    component: summary,
    canActivate: [AuthGuard]
  },
  {
    path: 'hold',
    component: holding,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login',
  }
];