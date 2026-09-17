import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('authInterceptor', () => {
  let auth: {
    refreshToken: ReturnType<typeof vi.fn>;
    markSessionExpired: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let messageService: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = {
      refreshToken: vi.fn(),
      markSessionExpired: vi.fn(),
      logout: vi.fn().mockResolvedValue(undefined),
    };
    messageService = {
      add: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: MessageService, useValue: messageService },
      ],
    });
  });

  it('should not refresh a 401 from an unprotected URL', async () => {
    const error = new HttpErrorResponse({ status: 401, url: '/authServices/session' });
    const next = vi.fn(() => throwError(() => error));
    const request = new HttpRequest('GET', '/authServices/session');

    await expect(
      firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(request, next))),
    ).rejects.toBe(error);

    expect(auth.refreshToken).not.toHaveBeenCalled();
  });

  it('should refresh once and retry a protected request', async () => {
    const error = new HttpErrorResponse({ status: 401, url: '/mscServices/api/users' });
    const response = new HttpResponse({ status: 200, url: '/mscServices/api/users' });
    const next = vi
      .fn()
      .mockReturnValueOnce(throwError(() => error))
      .mockReturnValueOnce(of(response));
    const request = new HttpRequest('GET', '/mscServices/api/users');
    auth.refreshToken.mockReturnValue(of(true));

    await expect(
      firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(request, next))),
    ).resolves.toBe(response);

    expect(auth.refreshToken).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('should expire the session when token refresh is rejected', async () => {
    const error = new HttpErrorResponse({ status: 401, url: '/msaServices/api/accounts' });
    const next = vi.fn(() => throwError(() => error));
    const request = new HttpRequest('GET', '/msaServices/api/accounts');
    auth.refreshToken.mockReturnValue(of(false));

    await expect(
      firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(request, next))),
    ).rejects.toBe(error);

    expect(auth.markSessionExpired).toHaveBeenCalledOnce();
    expect(auth.logout).toHaveBeenCalledOnce();
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'warn',
        summary: 'Sesión expirada',
        detail: 'Su sesión ha caducado. Inicie sesión nuevamente.',
      }),
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
});
