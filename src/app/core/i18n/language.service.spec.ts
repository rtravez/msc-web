import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  const translate = {
    setFallbackLang: vi.fn(() => ({ subscribe: vi.fn() })),
    use: vi.fn(() => ({ subscribe: vi.fn() })),
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [LanguageService, { provide: TranslateService, useValue: translate }],
    });
  });

  it('should set the document language from the saved language', () => {
    localStorage.setItem('msc-language', 'en');
    const service = TestBed.inject(LanguageService);
    TestBed.tick();

    expect(service.currentLanguage()).toBe('en');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
  });

  it('should update the document language when the language changes', () => {
    const service = TestBed.inject(LanguageService);
    const document = TestBed.inject(DOCUMENT);

    service.setLanguage('en');
    TestBed.tick();

    expect(document.documentElement.lang).toBe('en');
  });
});
