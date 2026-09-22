import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  templateUrl: './auth-callback.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCallback {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  protected readonly message = signal(this.translate.instant('callback.validating'));

  constructor() {
    afterNextRender(() => void this.processCallback());
  }

  private async processCallback(): Promise<void> {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    if (!code || !state) {
      this.message.set(this.translate.instant('callback.missingCode'));
      return;
    }
    try {
      await this.auth.completeLogin(code, state);
      await this.router.navigateByUrl('/dashboard');
    } catch {
      this.message.set(this.translate.instant('callback.failed'));
    }
  }
}
