import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AuthGuard } from './core/auth/auth.guard';
import { AUTH_ROLES } from './core/auth/auth-roles';

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
        data: { roles: [AUTH_ROLES.roleAdmin] },
        loadChildren: () => import('./features/users/users.routes').then((m) => m.usersRoutes),
      },
      {
        path: 'accounts',
        canActivate: [AuthGuard],
        data: { roles: [AUTH_ROLES.accountsRead] },
        loadChildren: () =>
          import('./features/accounts/accounts.routes').then((m) => m.accountsRoutes),
      },
      {
        path: 'movements',
        canActivate: [AuthGuard],
        data: { roles: [AUTH_ROLES.movementsRead] },
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
