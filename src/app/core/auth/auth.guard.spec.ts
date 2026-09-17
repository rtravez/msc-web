import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { RoleCanMatch } from './auth.guard';

describe('RoleCanMatch', () => {
  const route = { data: { roles: ['ADMIN'] } } as any;

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
