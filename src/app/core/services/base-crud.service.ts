import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponseDto } from '../models/base-response.interface';
import { BaseResponsePage } from '../models/base-response-page.interface';

export abstract class BaseCrudService<TResponse, TItem, TRequest> {
  protected constructor(
    protected readonly http: HttpClient,
    protected readonly apiUrl: string,
  ) {}

  protected getAll(
    page = 0,
    size = 20,
    extraParams?: HttpParams,
  ): Observable<BaseResponsePage<TItem>> {
    const params = (extraParams ?? new HttpParams()).set('page', page).set('size', size);

    return this.http
      .get<BaseResponseDto<BaseResponsePage<TResponse>>>(this.apiUrl, { params })
      .pipe(map((response) => this.unwrapPage(response.data, page, size)));
  }

  protected getById(id: number): Observable<TItem> {
    return this.http
      .get<BaseResponseDto<TResponse>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => this.unwrapSingle(response)));
  }

  protected create(request: TRequest): Observable<TItem> {
    return this.http
      .post<BaseResponseDto<TResponse>>(this.apiUrl, request)
      .pipe(map((response) => this.unwrapSingle(response)));
  }

  protected update(id: number, request: TRequest): Observable<TItem> {
    return this.http
      .put<BaseResponseDto<TResponse>>(`${this.apiUrl}/${id}`, request)
      .pipe(map((response) => this.unwrapSingle(response)));
  }

  protected delete(id: number): Observable<BaseResponseDto<number>> {
    return this.http.delete<BaseResponseDto<number>>(`${this.apiUrl}/${id}`);
  }

  protected unwrapPage(
    pageData: BaseResponsePage<TResponse> | undefined,
    page: number,
    size: number,
  ): BaseResponsePage<TItem> {
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
      content: pageData.content.map((item) => this.toItem(item)),
    };
  }

  protected unwrapSingle(response: BaseResponseDto<TResponse>): TItem {
    return this.toItem(response.data);
  }

  protected toItem(item: TResponse): TItem {
    return { ...(item as unknown as Record<string, unknown>) } as TItem;
  }
}
