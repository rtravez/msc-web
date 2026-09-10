import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.includes('/api/')) {
    return next(request);
  }

  const auth = inject(AuthService);

  return from(auth.getValidAccessToken()).pipe(
    switchMap((token) => next(token
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request
    ).pipe(
      catchError((error) => {
        if (error.status !== 401 || !token) return throwError(() => error);

        return from(auth.refreshAccessToken(true)).pipe(
          switchMap((refreshedToken) => refreshedToken
            ? next(request.clone({ setHeaders: { Authorization: `Bearer ${refreshedToken}` } }))
            : throwError(() => error)
          )
        );
      })
    ))
  );
};
