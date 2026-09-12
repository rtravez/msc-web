import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BaseResponsePage } from '../../../core/models/base-response-page.interface';
import { BaseResponseDto } from '../../../core/models/base-response.interface';
import { User, UserRequest, UserResponse } from '../models/user.interface';

/**
 * Service for user management CRUD operations
 * Communicates with backend UserController endpoints
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.mscServices}/api/users`;
  private readonly http = inject(HttpClient);

  /**
   * Get paginated users
   * GET /api/users?page=0&size=20
   */
  getAllUsers(page = 0, size = 20): Observable<BaseResponsePage<User>> {
    return this.http
      .get<BaseResponseDto<BaseResponsePage<UserResponse>>>(this.apiUrl, {
        params: new HttpParams().set('page', page).set('size', size),
      })
      .pipe(
        map((response) => {
          const pageData = response.data;
          if (!pageData?.content) {
            return {
              content: [],
              totalElements: 0,
              totalPages: 0,
              number: page,
              size,
            };
          }

          return {
            ...pageData,
            content: pageData.content.map((user) => ({ ...user })),
          };
        }),
      );
  }

  /**
   * Find user by identification
   * GET /api/users/identification?identification={value}
   * @param identification - User identification number
   */
  getUserByIdentification(identification: string): Observable<User> {
    return this.http
      .get<BaseResponseDto<UserResponse>>(`${this.apiUrl}/identification`, {
        params: { identification },
      })
      .pipe(map((response) => this.unwrapUser(response)));
  }

  /**
   * Get user by ID
   * GET /api/users/{id}
   * @param userId - User ID
   */
  getUserById(userId: number): Observable<User> {
    return this.http
      .get<BaseResponseDto<UserResponse>>(`${this.apiUrl}/${userId}`)
      .pipe(map((response) => this.unwrapUser(response)));
  }

  /**
   * Create a new user
   * POST /api/users
   * @param user - User data to create
   */
  createUser(user: UserRequest): Observable<User> {
    return this.http
      .post<BaseResponseDto<UserResponse>>(this.apiUrl, user)
      .pipe(map((response) => this.unwrapUser(response)));
  }

  /**
   * Update an existing user
   * PUT /api/users/{id}
   * @param userId - User ID to update
   * @param request - User data to update
   */
  updateUser(userId: number, request: UserRequest): Observable<User> {
    return this.http
      .put<BaseResponseDto<UserResponse>>(`${this.apiUrl}/${userId}`, request)
      .pipe(map((response) => this.unwrapUser(response)));
  }

  /**
   * Delete a user by ID
   * DELETE /api/users/{id}
   * @param userId - User ID to delete
   */
  deleteUser(userId: number): Observable<BaseResponseDto<number>> {
    return this.http.delete<BaseResponseDto<number>>(`${this.apiUrl}/${userId}`);
  }

  private unwrapUser(response: BaseResponseDto<UserResponse>): User {
    return { ...response.data };
  }
}
