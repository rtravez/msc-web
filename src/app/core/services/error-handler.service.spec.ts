import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    service = new ErrorHandlerService();
  });

  it('should prefer the first backend error over detail and fallback', () => {
    const error = new HttpErrorResponse({
      status: 400,
      url: '/mscServices/api/accounts',
      error: {
        errors: ['Account already exists'],
        detail: 'Invalid account',
      },
    });

    expect(service.getMessage(error, 'Fallback')).toBe('Account already exists');
  });

  it('should use detail or fallback when the response has no error list', () => {
    const detailError = new HttpErrorResponse({
      status: 500,
      error: { detail: 'Service unavailable' },
    });
    const emptyError = new HttpErrorResponse({ status: 500, error: { detail: 500 } });

    expect(service.getMessage(detailError, 'Fallback')).toBe('Service unavailable');
    expect(service.getMessage(emptyError, 'Fallback')).toBe('Fallback');
  });

  it('should log HTTP metadata without logging the response body', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      url: '/mscServices/api/accounts',
      error: { detail: 'Sensitive server detail' },
    });

    service.log(error, 'Loading accounts');

    expect(log).toHaveBeenCalledWith('Loading accounts', {
      status: 401,
      url: '/mscServices/api/accounts',
    });
    expect(log.mock.calls[0]).not.toContain('Sensitive server detail');
    log.mockRestore();
  });
});
