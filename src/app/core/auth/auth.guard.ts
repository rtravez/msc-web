import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
  authData: AuthGuardData,
): Promise<boolean | ReturnType<import('@angular/router').Router['parseUrl']>> => {
  const { authenticated, grantedRoles } = authData;

  const requiredRoles: string[] = route.data?.['roles'] ?? [];

  if (!authenticated) {
    return false;
  }

  if (requiredRoles.length === 0) {
    return true;
  }

  const userRoles = new Set([
    ...(grantedRoles.realmRoles ?? []),
    ...Object.values(grantedRoles.resourceRoles ?? {}).flat(),
  ]);

  const hasAllRoles = requiredRoles.every((role) => userRoles.has(role));
  return hasAllRoles ? true : inject(Router).parseUrl('/dashboard');
};

export const AuthGuard: CanActivateFn = createAuthGuard(isAccessAllowed);
