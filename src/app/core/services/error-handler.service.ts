import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface ErrorPayload {
  detail?: unknown;
  errors?: unknown;
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  getMessage(error: unknown, fallback: string): string {
    const payload = this.getPayload(error);
    const firstError = Array.isArray(payload?.errors) ? payload.errors[0] : undefined;

    return this.asMessage(firstError) ?? this.asMessage(payload?.detail) ?? fallback;
  }

  log(error: unknown, context: string): void {
    if (error instanceof HttpErrorResponse) {
      console.error(context, {
        status: error.status,
        url: error.url,
      });
      return;
    }

    console.error(context, error instanceof Error ? error.message : 'Unexpected error');
  }

  private getPayload(error: unknown): ErrorPayload | null {
    if (!(error instanceof HttpErrorResponse) || !this.isRecord(error.error)) {
      return null;
    }

    return error.error;
  }

  private isRecord(value: unknown): value is ErrorPayload {
    return typeof value === 'object' && value !== null;
  }

  private asMessage(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value : undefined;
  }
}
