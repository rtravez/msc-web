import { Routes } from '@angular/router';

/**
 * User feature routes
 * Lazy loaded from app routes
 */
export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/user-list/user-list').then(m => m.UserList)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/user-form/user-form').then(m => m.UserForm)
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/user-form/user-form').then(m => m.UserForm)
  }
];
