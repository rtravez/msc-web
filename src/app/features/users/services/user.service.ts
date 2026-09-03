import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserResponse, UserRequest } from '../models/user.interface';
import { BaseResponseDto } from '../../../core/models/base-response.interface';

/**
 * Service for user management CRUD operations
 * Communicates with backend UserController endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:8081/mscServices/api/users';
  private readonly http = inject(HttpClient);

  /**
   * Get all users
   * GET /api/users
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<BaseResponseDto<UserResponse[]>>(this.apiUrl).pipe(
      map(response => response.data ? response.data.map(u => ({ ...u })) : [])
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
   * PUT /api/users
   * @param user - User data to update
   */
  updateUser(user: UserRequest): Observable<User> {
    return this.http.put<UserResponse>(this.apiUrl, user).pipe(
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
