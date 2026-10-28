import { Routes } from '@angular/router';
import { LoginUser } from './auth/login-user/login-user';
import { MainLayout } from './layout/main-layout/main-layout';
import { Plan } from './pages/plan/plan';
import { Fuel } from './pages/fuel/fuel';
import { Guide } from './pages/guide/guide';
import { Profile } from './pages/profile/profile';
import { authGuard } from './core/guards/role.guards';

export class AppRoutes {}

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login-user',
    pathMatch: 'full'
  },
  {
    path: 'login-user',
    component: LoginUser
  },
  {
    path: 'main-dashboard',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'plan',
        pathMatch: 'full'
      },
      {
        path: 'plan',
        component: Plan
      },
      {
        path: 'fuels',
        component: Fuel
      },
      {
        path: 'guide',
        component: Guide
      },
      {
        path: 'profile',
        component: Profile
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login-user'
  }
];
