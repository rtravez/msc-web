/**
 * Base response DTO that wraps all API responses
 */
export interface BaseResponseDto<T = unknown> {
  status: number;
  detail?: string;
  properties?: Record<string, unknown>;
  data: T;
}
