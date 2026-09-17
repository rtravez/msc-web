import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const AUTH_RETRY = new HttpContextToken<boolean>(() => false);
const PROTECTED_API_URL = /^\/(mscServices|msaServices)\/api(?:\/|$)/i;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const messageService = inject(MessageService);

  const expireSession = () => {
    auth.markSessionExpired();
    messageService.add({
      severity: 'warn',
      summary: 'Sesión expirada',
      detail: 'Su sesión ha caducado. Inicie sesión nuevamente.',
      life: 5000,
    });
    void auth.logout();
  };

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status !== 401 ||
        !PROTECTED_API_URL.test(request.url) ||
        request.context.get(AUTH_RETRY)
      ) {
        return throwError(() => error);
      }

      return auth.refreshToken().pipe(
        catchError(() => {
          expireSession();
          return throwError(() => error);
        }),
        switchMap((refreshed) => {
          if (!refreshed) {
            expireSession();
            return throwError(() => error);
          }

          return next(
            request.clone({
              context: request.context.set(AUTH_RETRY, true),
            }),
          );
        }),
      );
    }),
  );
};
