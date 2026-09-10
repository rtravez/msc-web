import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponsePage } from '../../../core/models/base-response-page.interface';
import { BaseResponseDto } from '../../../core/models/base-response.interface';
import { User, UserRequest, UserResponse } from '../models/user.interface';

/**
 * Service for user management CRUD operations
 * Communicates with backend UserController endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = '/mscServices/api/users';
  private readonly http = inject(HttpClient);

  /**
   * Get paginated users
   * GET /api/users?page=0&size=20
   */
  getAllUsers(page = 0, size = 20): Observable<BaseResponsePage<User>> {
    return this.http.get<BaseResponseDto<BaseResponsePage<UserResponse>>>(`${this.apiUrl}?page=${page}&size=${size}`).pipe(
      map(response => {
        const pageData = response?.data ?? {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: page,
          size,
        };

        return {
          ...pageData,
          content: (pageData.content ?? []).map((user) => ({ ...user })),
        };
      })
    );
  }

  /**
   * Find user by identification
   * POST /api/users/findUserByIdentification
   * @param identification - User identification number
   */
  findUserByIdentification(identification: string): Observable<User> {
    return this.http.post<UserResponse>(
      `${this.apiUrl}/findUserByIdentification`,
      { identification }
    ).pipe(
      map(user => ({ ...user }))
    );
  }

  /**
   * Get user by ID
   * Convenience method that uses findUserByIdentification
   * @param identification - User identification
   */
  getUserById(identification: string): Observable<User> {
    return this.findUserByIdentification(identification);
  }

  /**
   * Create a new user
   * POST /api/users
   * @param user - User data to create
   */
  createUser(user: UserRequest): Observable<User> {
    return this.http.post<UserResponse>(this.apiUrl, user).pipe(
      map(response => ({ ...response }))
    );
  }

  /**
   * Update an existing user
   * PUT /api/users/{id}
   * @param userId - User ID to update
   * @param request - User data to update
   */
  updateUser(userId: number, request: UserRequest): Observable<User> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${userId}`, request).pipe(
      map(response => ({ ...response }))
    );
  }

  /**
   * Delete a user by ID
   * DELETE /api/users/{id}
   * @param userId - User ID to delete
   */
  deleteUser(userId: number): Observable<BaseResponseDto<any>> {
    return this.http.delete<BaseResponseDto<any>>(`${this.apiUrl}/${userId}`);
  }
}
