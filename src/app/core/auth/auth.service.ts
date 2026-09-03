import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { authConfig, authorizationEndpoint, tokenEndpoint } from './auth.config';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly document = inject(DOCUMENT);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'msc.oauth.tokens';
  readonly isAuthenticated = signal(this.readTokens() !== null);

  async startLogin(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    const verifier = this.randomValue(64);
    const state = this.randomValue(32);
    localStorage.setItem('msc.oauth.verifier', verifier);
    localStorage.setItem('msc.oauth.state', state);
    const challenge = this.base64Url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
    const params = new URLSearchParams({
      response_type: 'code', client_id: authConfig.clientId, redirect_uri: authConfig.redirectUri,
      scope: authConfig.scope, state, code_challenge: challenge, code_challenge_method: 'S256',
    });
    this.document.location.href = `${authorizationEndpoint}?${params}`;
  }

  async completeLogin(code: string, state: string): Promise<void> {
    const expectedState = localStorage.getItem('msc.oauth.state');
    const verifier = localStorage.getItem('msc.oauth.verifier');
    if (!expectedState || state !== expectedState || !verifier) throw new Error('La sesión de autorización no es válida.');
    const body = new URLSearchParams({
      grant_type: 'authorization_code', client_id: authConfig.clientId,
      redirect_uri: authConfig.redirectUri, code, code_verifier: verifier
    });
    const tokens = await firstValueFrom(this.http.post<TokenResponse>(tokenEndpoint, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }));
    localStorage.setItem(this.storageKey, JSON.stringify(tokens));
    localStorage.removeItem('msc.oauth.state');
    localStorage.removeItem('msc.oauth.verifier');
    this.isAuthenticated.set(true);
  }

  accessToken(): string | null { return this.readTokens()?.access_token ?? null; }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem(this.storageKey);
    this.isAuthenticated.set(false);
  }

  private readTokens(): TokenResponse | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try { return JSON.parse(raw) as TokenResponse; } catch { return null; }
  }

  private randomValue(bytes: number): string {
    const values = new Uint8Array(bytes);
    crypto.getRandomValues(values);
    return this.base64Url(values);
  }

  private base64Url(value: ArrayBuffer | Uint8Array): string {
    const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    let binary = '';
    bytes.forEach((byte) => binary += String.fromCodePoint(byte));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}