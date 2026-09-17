import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  ReadyArgs,
  typeEventArgs,
} from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { Router } from '@angular/router';
import { finalize, from, Observable, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  private readonly router = inject(Router);
  private readonly loadingState = signal(true);
  private readonly authenticatedState = signal(false);
  private readonly usernameState = signal<string | undefined>(undefined);
  private readonly sessionExpiredState = signal(false);

  readonly loading = this.loadingState.asReadonly();
  readonly authenticated = this.authenticatedState.asReadonly();
  readonly username = this.usernameState.asReadonly();
  readonly sessionExpired = this.sessionExpiredState.asReadonly();

  constructor() {
    effect(() => {
      const event = this.keycloakSignal();

      if (event.type === KeycloakEventType.Ready) {
        const authenticated = typeEventArgs<ReadyArgs>(event.args);
        this.setSessionState(authenticated);
        this.loadingState.set(false);
        return;
      }

      if (event.type === KeycloakEventType.AuthLogout) {
        this.clearSessionState();
        this.loadingState.set(false);
        return;
      }

      if (
        event.type === KeycloakEventType.AuthError ||
        event.type === KeycloakEventType.AuthRefreshError
      ) {
        this.markSessionExpired();
      }
    });
  }

  readonly roles = computed(() => {
    const realmRoles = this.keycloak.tokenParsed?.realm_access?.roles ?? [];
    const clientRoles =
      this.keycloak.tokenParsed?.resource_access?.[this.keycloak.clientId ?? '']?.roles ?? [];
    return [...realmRoles, ...clientRoles];
  });

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  login(redirectUri?: string): Promise<void> {
    return this.keycloak.login({ redirectUri: redirectUri ?? window.location.origin });
  }

  logout(redirectUri?: string): Promise<void> {
    this.clearSessionState();

    return this.keycloak
      .logout({ redirectUri: redirectUri ?? window.location.origin })
      .catch(() => {
        this.keycloak.clearToken();
        return this.router.navigateByUrl('/');
      })
      .then(() => undefined);
  }

  markSessionExpired(): void {
    this.authenticatedState.set(false);
    this.usernameState.set(undefined);
    this.sessionExpiredState.set(true);
    this.loadingState.set(false);
  }

  private refreshToken$?: Observable<boolean> | null = null;

  refreshToken(): Observable<boolean> {
    const refresh$ = (this.refreshToken$ ??= from(this.updateToken(-1)).pipe(
      finalize(() => {
        this.refreshToken$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    ));

    return refresh$;
  }

  updateToken(minValidity: number): Promise<boolean> {
    return this.keycloak.updateToken(minValidity);
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  private setSessionState(authenticated: boolean): void {
    this.authenticatedState.set(authenticated);
    this.usernameState.set(
      authenticated
        ? (this.keycloak.tokenParsed?.['preferred_username'] as string | undefined)
        : undefined,
    );
    this.sessionExpiredState.set(false);
  }

  private clearSessionState(): void {
    this.authenticatedState.set(false);
    this.usernameState.set(undefined);
    this.sessionExpiredState.set(false);
  }
}
