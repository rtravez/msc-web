import { Routes } from '@angular/router';
import { UserList } from './components/user-list/user-list';

/**
 * User feature routes
 * Lazy loaded from app routes
 */
export const usersRoutes: Routes = [
  {
    path: '',
    component: UserList
  }
];
