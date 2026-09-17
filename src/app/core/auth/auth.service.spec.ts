import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let keycloak: ReturnType<typeof vi.fn> & Partial<Keycloak>;

  beforeEach(() => {
    keycloak = vi.fn();
    keycloak.updateToken = vi.fn().mockResolvedValue(true);
    keycloak.login = vi.fn();
    keycloak.logout = vi.fn().mockResolvedValue(undefined);
    keycloak.clearToken = vi.fn();
    Object.assign(keycloak, { clientId: 'msc-web' });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Keycloak, useValue: keycloak },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: signal({ type: KeycloakEventType.Ready, args: true }),
        },
        { provide: Router, useValue: { navigateByUrl: vi.fn().mockResolvedValue(true) } },
      ],
    });
  });

  it('should reuse the same refresh request while one is in progress', () => {
    const service = TestBed.inject(AuthService);

    const first = service.refreshToken();
    const second = service.refreshToken();

    expect(keycloak.updateToken).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);

    first.subscribe();
    second.subscribe();
  });

  it('should clear the expired state when logging out', async () => {
    const service = TestBed.inject(AuthService);

    service.markSessionExpired();
    expect(service.sessionExpired()).toBe(true);

    await service.logout();

    expect(service.sessionExpired()).toBe(false);
  });

  it('should check realm and client roles from the token', () => {
    Object.assign(keycloak, {
      tokenParsed: {
        realm_access: { roles: ['ADMIN'] },
        resource_access: { 'msc-web': { roles: ['REPORT_VIEWER'] } },
      },
    });
    const service = TestBed.inject(AuthService);

    expect(service.hasAllRoles(['ADMIN', 'REPORT_VIEWER'])).toBe(true);
    expect(service.hasAllRoles(['ADMIN', 'MISSING'])).toBe(false);
  });
});
