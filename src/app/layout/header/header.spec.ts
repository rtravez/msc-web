import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Header } from './header';

describe('Header', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header, TranslateModule.forRoot()],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('shows the sidebar toggle button on desktop', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="accessibility.toggleSidebar"]',
    ) as HTMLButtonElement | null;

    expect(button).not.toBeNull();
    expect(button?.classList.contains('d-lg-none')).toBeFalse();
  });
});
