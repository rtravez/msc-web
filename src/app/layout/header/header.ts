import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import Keycloak from 'keycloak-js';
import { LanguageService, SupportedLanguage } from '../../core/i18n/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  @Output() readonly toggleSidebar = new EventEmitter<void>();
  protected readonly language = inject(LanguageService);
  protected mobileMenuOpen = false;
  private readonly keycloak = inject(Keycloak);

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    void this.keycloak.logout({ redirectUri: window.location.origin });
  }

  setLanguage(language: SupportedLanguage): void {
    this.language.setLanguage(language);
  }
}
