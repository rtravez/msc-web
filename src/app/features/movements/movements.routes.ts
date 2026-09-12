import { Routes } from '@angular/router';

export const movementsRoutes: Routes = [
  {
    path: 'reports',
    loadComponent: () =>
      import('./components/movement-report/movement-report').then((m) => m.MovementReport),
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/movement-list/movement-list').then((m) => m.MovementList),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/movement-form/movement-form').then((m) => m.MovementForm),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/movement-form/movement-form').then((m) => m.MovementForm),
  },
];