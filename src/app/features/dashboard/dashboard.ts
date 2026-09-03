import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService, SupportedLanguage } from '../../core/i18n/language.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, RouterLinkActive, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly language = inject(LanguageService);

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  setLanguage(language: SupportedLanguage): void {
    this.language.setLanguage(language);
  }
}
