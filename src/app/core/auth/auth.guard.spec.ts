import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import Keycloak from 'keycloak-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard, RoleCanMatch } from './auth.guard';
import { AuthService } from './auth.service';

describe('RoleCanMatch', () => {
  const route: { data: { roles: string[] } } = { data: { roles: ['ADMIN'] } };

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should not match for unauthenticated users so the parent auth guard handles login', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticated: vi.fn(() => false),
            hasAllRoles: vi.fn(),
          },
        },
        {
          provide: Router,
          useValue: {
            parseUrl: vi.fn((path: string) => ({ url: path })),
          },
        },
      ],
    });

    const result = TestBed.runInInjectionContext(() => RoleCanMatch(route, []));

    expect(result).toBe(false);
    const router = TestBed.inject(Router);
    expect(router.parseUrl).not.toHaveBeenCalled();
  });

  it('should redirect to forbidden when the user is authenticated but lacks required roles', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticated: vi.fn(() => true),
            hasAllRoles: vi.fn(() => false),
          },
        },
        {
          provide: Router,
          useValue: {
            parseUrl: vi.fn((path: string) => ({ url: path })),
          },
        },
      ],
    });

    const result = TestBed.runInInjectionContext(() => RoleCanMatch(route, []));

    expect(result).toEqual({ url: '/forbidden' });
    const router = TestBed.inject(Router);
    expect(router.parseUrl).toHaveBeenCalledWith('/forbidden');
  });
});

describe('AuthGuard', () => {
  const route = { data: { roles: ['ADMIN'] } } as unknown as ActivatedRouteSnapshot;
  const state = { url: '/users' } as unknown as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should start the login flow when the user is unauthenticated', async () => {
    const login = vi.fn();
    const router = { parseUrl: vi.fn((path: string) => ({ url: path })) };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticated: vi.fn(() => false),
            hasAllRoles: vi.fn(() => true),
          },
        },
        { provide: Router, useValue: router },
        {
          provide: Keycloak,
          useValue: {
            authenticated: false,
            login,
            realmAccess: { roles: [] },
            resourceAccess: {},
          },
        },
      ],
    });

    const result = await TestBed.runInInjectionContext(() => AuthGuard(route, state));

    expect(result).toBe(false);
    expect(login).toHaveBeenCalledWith({ redirectUri: 'http://localhost:3000/users' });
    expect(router.parseUrl).not.toHaveBeenCalled();
  });

  it('should authorize when the user has every required role', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticated: vi.fn(() => true),
            hasAllRoles: vi.fn(() => true),
          },
        },
        {
          provide: Router,
          useValue: {
            parseUrl: vi.fn((path: string) => ({ url: path })),
          },
        },
        {
          provide: Keycloak,
          useValue: {
            authenticated: true,
            login: vi.fn(),
            realmAccess: { roles: ['ADMIN'] },
            resourceAccess: {},
          },
        },
      ],
    });

    const result = await TestBed.runInInjectionContext(() => AuthGuard(route, state));

    expect(result).toBe(true);
  });

  it('should deny access and redirect to forbidden when the user lacks required roles', async () => {
    const router = { parseUrl: vi.fn((path: string) => ({ url: path })) };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticated: vi.fn(() => true),
            hasAllRoles: vi.fn(() => false),
          },
        },
        { provide: Router, useValue: router },
        {
          provide: Keycloak,
          useValue: {
            authenticated: true,
            login: vi.fn(),
            realmAccess: { roles: [] },
            resourceAccess: {},
          },
        },
      ],
    });

    const result = await TestBed.runInInjectionContext(() => AuthGuard(route, state));

    expect(result).toEqual({ url: '/forbidden' });
    expect(router.parseUrl).toHaveBeenCalledWith('/forbidden');
  });
});
