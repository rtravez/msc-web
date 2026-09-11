export interface BaseResponsePage<T = unknown> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
