import {
  ActivatedRouteSnapshot,
  CanMatchFn,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import { AuthService } from './auth.service';

const OIDC_CALLBACK_PARAMETERS = [
  'code',
  'error',
  'error_description',
  'error_uri',
  'iss',
  'session_state',
  'state',
] as const;

const getLoginRedirectUri = (routerUrl: string): string => {
  const redirectUrl = new URL(routerUrl, window.location.origin);

  for (const parameter of OIDC_CALLBACK_PARAMETERS) {
    redirectUrl.searchParams.delete(parameter);
  }

  return redirectUrl.toString();
};

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData,
): Promise<boolean | ReturnType<import('@angular/router').Router['parseUrl']>> => {
  const { authenticated, grantedRoles, keycloak } = authData;

  const requiredRoles: string[] = route.data?.['roles'] ?? [];

  if (!authenticated) {
    await keycloak.login({
      redirectUri: getLoginRedirectUri(state.url),
    });
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
  return hasAllRoles ? true : inject(Router).parseUrl('/forbidden');
};

export const AuthGuard: CanActivateFn = createAuthGuard(isAccessAllowed);

export const RoleCanMatch: CanMatchFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredRoles: string[] = route.data?.['roles'] ?? [];

  if (!auth.authenticated()) {
    return router.parseUrl('/dashboard');
  }

  return requiredRoles.every((role) => auth.hasRole(role)) ? true : router.parseUrl('/forbidden');
};
