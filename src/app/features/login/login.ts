import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService, SupportedLanguage } from '../../core/i18n/language.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [TranslatePipe],
})
export class Login implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly language = inject(LanguageService);
  protected readonly loading = signal(false);

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/dashboard');
    }
  }

  async login(): Promise<void> {
    this.loading.set(true);
    await this.auth.startLogin();
  }

  setLanguage(language: SupportedLanguage): void {
    this.language.setLanguage(language);
  }
}
