import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BaseResponseDto } from '../../../core/models/base-response.interface';
import { BaseResponsePage } from '../../../core/models/base-response-page.interface';
import { BaseCrudService } from '../../../core/services/base-crud.service';
import { User, UserRequest, UserResponse } from '../models/user.interface';

/**
 * Service for user management CRUD operations
 * Communicates with backend UserController endpoints
 */
@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseCrudService<UserResponse, User, UserRequest> {
  protected override readonly http: HttpClient;

  constructor() {
    const http = inject(HttpClient);
    super(http, `${environment.mscServices}/api/users`);
    this.http = http;
  }

  /**
   * Get paginated users
   * GET /api/users?page=0&size=20
   */
  getAllUsers(page = 0, size = 20): Observable<BaseResponsePage<User>> {
    return this.getAll(page, size);
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
      .pipe(map((response) => this.unwrapSingle(response)));
  }

  /**
   * Get user by ID
   * GET /api/users/{id}
   * @param userId - User ID
   */
  getUserById(userId: number): Observable<User> {
    return this.getById(userId);
  }

  /**
   * Create a new user
   * POST /api/users
   * @param user - User data to create
   */
  createUser(user: UserRequest): Observable<User> {
    return this.create(user);
  }

  /**
   * Update an existing user
   * PUT /api/users/{id}
   * @param userId - User ID to update
   * @param request - User data to update
   */
  updateUser(userId: number, request: UserRequest): Observable<User> {
    return this.update(userId, request);
  }

  /**
   * Delete a user by ID
   * DELETE /api/users/{id}
   * @param userId - User ID to delete
   */
  deleteUser(userId: number): Observable<BaseResponseDto<number>> {
    return this.delete(userId);
  }
}
