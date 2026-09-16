import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      return auth.refreshToken().pipe(
        switchMap(() => next(request)),
        catchError(() => {
          auth.markSessionExpired();
          void auth.logout();
          return throwError(() => error);
        }),
      );
    }),
  );
};
