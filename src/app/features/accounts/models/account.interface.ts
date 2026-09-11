export interface AccountResponse {
  accountId: number;
  personId?: number;
  accountNumber: number;
  accountType: string;
  initialBalance: number;
  identification: string;
  name?: string;
  lastname?: string;
  status: boolean;
}

export interface AccountRequest {
  accountId?: number;
  accountNumber: number;
  accountType: string;
  initialBalance: number;
  identification: string;
}

export type Account = AccountResponse;
