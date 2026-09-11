import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BaseResponsePage } from '../../../core/models/base-response-page.interface';
import { BaseResponseDto } from '../../../core/models/base-response.interface';
import { Account, AccountRequest, AccountResponse } from '../models/account.interface';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly apiUrl = `${environment.msaServices}/api/accounts`;
  private readonly http = inject(HttpClient);

  getAllAccounts(page = 0, size = 20): Observable<BaseResponsePage<Account>> {
    return this.http
      .get<BaseResponseDto<BaseResponsePage<AccountResponse>>>(this.apiUrl, {
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

  getAccountById(accountId: number): Observable<Account> {
    return this.http
      .get<BaseResponseDto<AccountResponse>>(`${this.apiUrl}/${accountId}`)
      .pipe(map((response) => this.unwrapUser(response)));
  }

  createAccount(request: AccountRequest): Observable<Account> {
    return this.http
      .post<BaseResponseDto<AccountResponse>>(this.apiUrl, request)
      .pipe(map((response) => this.unwrapUser(response)));
  }

  updateAccount(accountId: number, request: AccountRequest): Observable<Account> {
    return this.http
      .put<BaseResponseDto<AccountResponse>>(`${this.apiUrl}/${accountId}`, request)
      .pipe(map((response) => this.unwrapUser(response)));
  }

  deleteAccount(accountId: number): Observable<BaseResponseDto<number>> {
    return this.http.delete<BaseResponseDto<number>>(`${this.apiUrl}/${accountId}`);
  }

  private unwrapUser(response: BaseResponseDto<AccountResponse>): Account {
    return { ...response.data };
  }
}
