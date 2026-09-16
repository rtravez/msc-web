import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { catchError, from, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const keycloak = inject(Keycloak);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      return from(keycloak.updateToken(-1)).pipe(
        switchMap(() => next(request)),
        catchError(() => {
          void keycloak.logout({ redirectUri: window.location.origin });
          return throwError(() => error);
        }),
      );
    }),
  );
};
