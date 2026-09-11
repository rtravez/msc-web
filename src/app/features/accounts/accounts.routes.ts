import { Routes } from '@angular/router';

export const accountsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/account-list/account-list').then((m) => m.AccountList),
  },
  {
    path: 'new',
    loadComponent: () => import('./components/account-form/account-form').then((m) => m.AccountForm),
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/account-form/account-form').then((m) => m.AccountForm),
  },
];