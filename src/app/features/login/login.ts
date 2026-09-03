import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService, SupportedLanguage } from '../../core/i18n/language.service';
import { ButtonDirective } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [ButtonDirective, TranslatePipe],
})
export class Login {
  private readonly auth = inject(AuthService);
  protected readonly language = inject(LanguageService);
  protected readonly loading = signal(false);

  async login(): Promise<void> {
    this.loading.set(true);
    await this.auth.startLogin();
  }

  setLanguage(language: SupportedLanguage): void {
    this.language.setLanguage(language);
  }
}