import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((module) => module.Login),
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./features/auth-callback/auth-callback').then((module) => module.AuthCallback),
  },
  {
    path: '',
    canActivate: [authGuard],
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((module) => module.Dashboard),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then((m) => m.usersRoutes),
      },
      {
        path: 'accounts',
        loadChildren: () =>
          import('./features/accounts/accounts.routes').then((m) => m.accountsRoutes),
      },
      {
        path: 'movements',
        loadChildren: () =>
          import('./features/movements/movements.routes').then((m) => m.movementsRoutes),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
