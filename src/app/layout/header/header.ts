import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService, SupportedLanguage } from '../../core/i18n/language.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly sidebarOpen = input(true);
  readonly toggleSidebar = output<void>();
  protected readonly language = inject(LanguageService);
  protected readonly auth = inject(AuthService);
  protected mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.mobileMenuOpen = false;
    void this.auth.logout();
  }

  setLanguage(language: SupportedLanguage): void {
    this.language.setLanguage(language);
  }
}
