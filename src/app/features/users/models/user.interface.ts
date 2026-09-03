/**
 * User response DTO from backend
 * Contains user information returned from API
 */
export interface UserResponse {
  userId: number;
  username: string;
  name: string;
  lastname: string;
  identification: string;
  address?: string;
  telephone?: string;
  status: boolean;
}

/**
 * User request DTO for creating/updating users
 * Extends PersonRequest fields
 */
export interface UserRequest {
  userId?: number;
  username: string;
  password: string;
  identification: string;
  name: string;
  lastname: string;
  address?: string;
  telephone?: string;
  gender?: string;
  age?: number;
  status?: boolean;
}

/**
 * User for use in forms and components
 * Combines request and response fields
 */
export interface User extends UserResponse {
  password?: string;
  gender?: string;
  age?: number;
}
