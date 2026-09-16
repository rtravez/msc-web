import { computed, inject, Injectable, Signal } from '@angular/core';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  ReadyArgs,
  typeEventArgs,
} from 'keycloak-angular';
import Keycloak from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  readonly authenticated: Signal<boolean> = computed(() => {
    const event = this.keycloakSignal();
    if (event.type === KeycloakEventType.Ready) {
      return typeEventArgs<ReadyArgs>(event.args);
    }
    if (event.type === KeycloakEventType.AuthLogout) {
      return false;
    }
    return this.keycloak.authenticated ?? false;
  });

  readonly username = computed(
    () => this.keycloak.tokenParsed?.['preferred_username'] as string | undefined,
  );

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
    return this.keycloak.login({ redirectUri: redirectUri ?? window.location.href });
  }

  logout(redirectUri?: string): Promise<void> {
    return this.keycloak.logout({ redirectUri: redirectUri ?? window.location.origin });
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }
}
