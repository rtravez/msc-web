/**
 * Base response DTO that wraps all API responses
 */
export interface BaseResponseDto<T> {
  code: number;
  message: string;
  errors?: string[];
  data: T;
}
