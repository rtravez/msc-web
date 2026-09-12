import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { authConfig, authorizationEndpoint, tokenEndpoint } from './auth.config';
import { LanguageService } from '../i18n/language.service';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
}

interface StoredTokenResponse extends TokenResponse {
  expires_at: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal(this.hasUsableSession(this.readTokens()));
  private readonly document = inject(DOCUMENT);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly language = inject(LanguageService);
  private readonly storageKey = 'msc.oauth.tokens';
  private refreshInFlight: Promise<string | null> | undefined;

  async startLogin(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    const verifier = this.randomValue(64);
    const state = this.randomValue(32);
    localStorage.setItem('msc.oauth.verifier', verifier);
    localStorage.setItem('msc.oauth.state', state);
    const challenge = this.base64Url(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)),
    );
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: authConfig.clientId,
      redirect_uri: authConfig.redirectUri,
      scope: authConfig.scope,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      lang: this.language.currentLanguage() === 'en' ? 'en-US' : 'es-EC',
    });
    this.document.location.href = `${authorizationEndpoint}?${params}`;
  }

  async completeLogin(code: string, state: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    const expectedState = localStorage.getItem('msc.oauth.state');
    const verifier = localStorage.getItem('msc.oauth.verifier');
    try {
      if (!expectedState || state !== expectedState || !verifier)
        throw new Error('La sesión de autorización no es válida.');
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: authConfig.clientId,
        redirect_uri: authConfig.redirectUri,
        code,
        code_verifier: verifier,
      });
      const tokens = await firstValueFrom(
        this.http.post<TokenResponse>(tokenEndpoint, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      this.storeTokens(tokens);
    } finally {
      this.clearLoginAttempt();
    }
  }

  async getValidAccessToken(): Promise<string | null> {
    const tokens = this.readTokens();
    if (!tokens) return null;
    if (this.hasValidAccessToken(tokens)) return tokens.access_token;
    return this.refreshAccessToken();
  }

  async refreshAccessToken(force = false): Promise<string | null> {
    const tokens = this.readTokens();
    if (!tokens) return null;
    if (!force && this.hasValidAccessToken(tokens)) return tokens.access_token;
    if (!tokens.refresh_token) {
      this.logout();
      return null;
    }

    if (!this.refreshInFlight) {
      this.refreshInFlight = this.requestTokenRefresh(tokens);
    }

    try {
      return await this.refreshInFlight;
    } finally {
      this.refreshInFlight = undefined;
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.storageKey);
      this.clearLoginAttempt();
    }
    this.isAuthenticated.set(false);
  }

  private async requestTokenRefresh(tokens: StoredTokenResponse): Promise<string | null> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: authConfig.clientId,
      refresh_token: tokens.refresh_token!,
    });

    try {
      const refreshed = await firstValueFrom(
        this.http.post<TokenResponse>(tokenEndpoint, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      this.storeTokens({
        ...refreshed,
        refresh_token: refreshed.refresh_token ?? tokens.refresh_token,
      });
      return refreshed.access_token;
    } catch {
      this.logout();
      return null;
    }
  }

  private storeTokens(tokens: TokenResponse): void {
    const expiresAt = Date.now() + tokens.expires_in * 1000;
    const storedTokens: StoredTokenResponse = { ...tokens, expires_at: expiresAt };
    localStorage.setItem(this.storageKey, JSON.stringify(storedTokens));
    this.isAuthenticated.set(true);
  }

  private readTokens(): StoredTokenResponse | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      const tokens = JSON.parse(raw) as Partial<StoredTokenResponse>;
      return typeof tokens.access_token === 'string' && typeof tokens.expires_at === 'number'
        ? (tokens as StoredTokenResponse)
        : null;
    } catch {
      return null;
    }
  }

  private hasUsableSession(tokens: StoredTokenResponse | null): boolean {
    return this.hasValidAccessToken(tokens) || Boolean(tokens?.refresh_token);
  }

  private hasValidAccessToken(tokens: StoredTokenResponse | null): boolean {
    return (
      tokens !== null && Boolean(tokens.access_token) && tokens.expires_at > Date.now() + 30_000
    );
  }

  private clearLoginAttempt(): void {
    localStorage.removeItem('msc.oauth.state');
    localStorage.removeItem('msc.oauth.verifier');
  }

  private randomValue(bytes: number): string {
    const values = new Uint8Array(bytes);
    crypto.getRandomValues(values);
    return this.base64Url(values);
  }

  private base64Url(value: ArrayBuffer | Uint8Array): string {
    const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    let binary = '';
    bytes.forEach((byte) => (binary += String.fromCodePoint(byte)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
