import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BaseResponsePage } from '../../../core/models/base-response-page.interface';
import { BaseResponseDto } from '../../../core/models/base-response.interface';
import { BaseCrudService } from '../../../core/services/base-crud.service';
import {
  Movement,
  MovementReportResponse,
  MovementRequest,
  MovementResponse,
} from '../models/movement.interface';

@Injectable({ providedIn: 'root' })
export class MovementService extends BaseCrudService<MovementResponse, Movement, MovementRequest> {
  constructor() {
    const http = inject(HttpClient);
    super(http, `${environment.msaServices}/api/movements`);
  }

  getAllMovements(page = 0, size = 20): Observable<BaseResponsePage<Movement>> {
    return this.getAll(page, size);
  }

  getMovementById(movementId: number): Observable<Movement> {
    return this.getById(movementId);
  }

  createMovement(request: MovementRequest): Observable<Movement> {
    return this.create(request);
  }

  updateMovement(movementId: number, request: MovementRequest): Observable<Movement> {
    return this.update(movementId, request);
  }

  deleteMovement(movementId: number): Observable<BaseResponseDto<number>> {
    return this.delete(movementId);
  }

  getMovementReport(
    initialDate: string,
    finalDate: string,
    identification: string,
    accountType: string,
    page = 0,
    size = 20,
  ): Observable<BaseResponsePage<MovementReportResponse>> {
    const params = new HttpParams()
      .set('initialDate', initialDate)
      .set('finalDate', finalDate)
      .set('identification', identification)
      .set('accountType', accountType)
      .set('page', page)
      .set('size', size);

    return this.http
      .get<BaseResponseDto<BaseResponsePage<MovementReportResponse>>>(`${this.apiUrl}/reports`, {
        params,
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
            content: [...pageData.content],
          };
        }),
      );
  }
}
