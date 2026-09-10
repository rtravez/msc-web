import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({ standalone: true, template: '<main class="callback"><p>{{ message() }}</p></main>' })
export class AuthCallback {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translate = inject(TranslateService);
  protected readonly message = signal('');

  constructor() {
    this.message.set(this.translate.instant('callback.validating'));
  }
  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId))
      return;
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) {
      this.message.set(this.translate.instant('callback.missingCode'));
      return;
    }
    try {
      await this.auth.completeLogin(code, state);
      await this.router.navigateByUrl('/dashboard');
    }
    catch {
      this.message.set(this.translate.instant('callback.failed'));
    }
  }
}