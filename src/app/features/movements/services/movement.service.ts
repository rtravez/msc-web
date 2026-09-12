import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BaseResponsePage } from '../../../core/models/base-response-page.interface';
import { BaseResponseDto } from '../../../core/models/base-response.interface';
import {
  Movement,
  MovementReportResponse,
  MovementRequest,
  MovementResponse,
} from '../models/movement.interface';

@Injectable({ providedIn: 'root' })
export class MovementService {
  private readonly apiUrl = `${environment.msaServices}/api/movements`;
  private readonly http = inject(HttpClient);

  getAllMovements(page = 0, size = 20): Observable<BaseResponsePage<Movement>> {
    return this.http
      .get<BaseResponseDto<BaseResponsePage<MovementResponse>>>(this.apiUrl, {
        params: new HttpParams().set('page', page).set('size', size),
      })
      .pipe(map((response) => this.unwrapPage(response.data, page, size)));
  }

  getMovementById(movementId: number): Observable<Movement> {
    return this.http
      .get<BaseResponseDto<MovementResponse>>(`${this.apiUrl}/${movementId}`)
      .pipe(map((response) => ({ ...response.data })));
  }

  createMovement(request: MovementRequest): Observable<Movement> {
    return this.http
      .post<BaseResponseDto<MovementResponse>>(this.apiUrl, request)
      .pipe(map((response) => ({ ...response.data })));
  }

  updateMovement(movementId: number, request: MovementRequest): Observable<Movement> {
    return this.http
      .put<BaseResponseDto<MovementResponse>>(`${this.apiUrl}/${movementId}`, request)
      .pipe(map((response) => ({ ...response.data })));
  }

  deleteMovement(movementId: number): Observable<BaseResponseDto<number>> {
    return this.http.delete<BaseResponseDto<number>>(`${this.apiUrl}/${movementId}`);
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
      .pipe(map((response) => this.unwrapPage(response.data, page, size)));
  }

  private unwrapPage<T>(
    pageData: BaseResponsePage<T> | undefined,
    page: number,
    size: number,
  ): BaseResponsePage<T> {
    return (
      pageData ?? {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: page,
        size,
      }
    );
  }
}
