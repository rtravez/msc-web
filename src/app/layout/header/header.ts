import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService, SupportedLanguage } from '../../core/i18n/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() readonly toggleSidebar = new EventEmitter<void>();
  protected readonly language = inject(LanguageService);
  protected mobileMenuOpen = false;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  setLanguage(language: SupportedLanguage): void {
    this.language.setLanguage(language);
  }
}
