import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            getValidAccessToken: () => Promise.resolve('access-token'),
            refreshAccessToken: () => Promise.resolve('refreshed-token'),
          },
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adds the access token to configured internal API requests', async () => {
    const http = TestBed.inject(HttpClient);
    http.get('/mscServices/api/users').subscribe();

    await Promise.resolve();
    const request = httpMock.expectOne('/mscServices/api/users');
    expect(request.request.headers.get('Authorization')).toBe('Bearer access-token');
    request.flush({});
  });

  it('does not send the token to URLs that only contain an API path', () => {
    const http = TestBed.inject(HttpClient);
    http.get('https://untrusted.example/api/users').subscribe();

    const request = httpMock.expectOne('https://untrusted.example/api/users');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
});
