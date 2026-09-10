import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLanguage = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly storageKey = 'msc-language';
  readonly currentLanguage = signal<SupportedLanguage>('es');

  constructor() {
    const savedLanguage = localStorage.getItem(this.storageKey);
    const language: SupportedLanguage = savedLanguage === 'en' ? 'en' : 'es';
    this.currentLanguage.set(language);
    this.translate.setFallbackLang('es').subscribe();
    this.translate.use(language).subscribe();
  }

  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage.set(language);
    localStorage.setItem(this.storageKey, language);
    this.translate.use(language).subscribe();
  }
}