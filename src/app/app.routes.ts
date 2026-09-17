import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((module) => module.Dashboard),
      },
      {
        path: 'users',
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/users/users.routes').then((m) => m.usersRoutes),
      },
      {
        path: 'accounts',
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () =>
          import('./features/accounts/accounts.routes').then((m) => m.accountsRoutes),
      },
      {
        path: 'movements',
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () =>
          import('./features/movements/movements.routes').then((m) => m.movementsRoutes),
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./features/forbidden/forbidden').then((module) => module.Forbidden),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
