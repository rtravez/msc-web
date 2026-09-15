import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseResponseDto } from '../../../core/models/base-response.interface';
import { BaseResponsePage } from '../../../core/models/base-response-page.interface';
import { BaseCrudService } from '../../../core/services/base-crud.service';
import { Account, AccountRequest, AccountResponse } from '../models/account.interface';

@Injectable({
  providedIn: 'root',
})
export class AccountService extends BaseCrudService<AccountResponse, Account, AccountRequest> {
  protected override readonly http: HttpClient;

  constructor() {
    const http = inject(HttpClient);
    super(http, `${environment.msaServices}/api/accounts`);
    this.http = http;
  }

  getAllAccounts(page = 0, size = 20): Observable<BaseResponsePage<Account>> {
    return this.getAll(page, size);
  }

  getAccountById(accountId: number): Observable<Account> {
    return this.getById(accountId);
  }

  createAccount(request: AccountRequest): Observable<Account> {
    return this.create(request);
  }

  updateAccount(accountId: number, request: AccountRequest): Observable<Account> {
    return this.update(accountId, request);
  }

  deleteAccount(accountId: number): Observable<BaseResponseDto<number>> {
    return this.delete(accountId);
  }
}
