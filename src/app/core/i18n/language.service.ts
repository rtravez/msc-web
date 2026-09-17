import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLanguage = 'es' | 'en';

const DEFAULT_LANGUAGE: SupportedLanguage = 'es';
const STORAGE_KEY = 'msc-language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly currentLanguage = signal<SupportedLanguage>(DEFAULT_LANGUAGE);
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);

  constructor() {
    const initialLanguage = this.resolveInitialLanguage();
    this.currentLanguage.set(initialLanguage);
    this.translate.setFallbackLang(DEFAULT_LANGUAGE).subscribe();
    this.applyLanguage(initialLanguage);

    effect(() => {
      this.document.documentElement.lang = this.currentLanguage();
    });
  }

  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage.set(language);
    localStorage.setItem(STORAGE_KEY, language);
    this.applyLanguage(language);
  }

  private resolveInitialLanguage(): SupportedLanguage {
    const savedLanguage = this.readStoredLanguage();
    if (savedLanguage) {
      return savedLanguage;
    }

    return this.getBrowserLanguage();
  }

  private readStoredLanguage(): SupportedLanguage | null {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    return this.isSupportedLanguage(savedLanguage) ? savedLanguage : null;
  }

  private getBrowserLanguage(): SupportedLanguage {
    const browserLanguage = navigator.language?.toLowerCase() ?? '';

    if (browserLanguage.startsWith('en')) {
      return 'en';
    }

    return DEFAULT_LANGUAGE;
  }

  private applyLanguage(language: SupportedLanguage): void {
    this.translate.use(language).subscribe();
  }

  private isSupportedLanguage(value: string | null): value is SupportedLanguage {
    return value === 'es' || value === 'en';
  }
}
