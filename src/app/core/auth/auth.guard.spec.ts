import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  it('allows navigation when a valid access token is available', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { getValidAccessToken: () => Promise.resolve('access-token') },
        },
        { provide: Router, useValue: { createUrlTree: vi.fn() } },
      ],
    });

    const result = await TestBed.runInInjectionContext(() => authGuard());

    expect(result).toBe(true);
  });

  it('redirects to login when the session cannot be validated', async () => {
    const loginUrlTree = { path: '/login' };
    const createUrlTree = vi.fn(() => loginUrlTree);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { getValidAccessToken: () => Promise.resolve(null) },
        },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });

    const result = await TestBed.runInInjectionContext(() => authGuard());

    expect(result).toBe(loginUrlTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
