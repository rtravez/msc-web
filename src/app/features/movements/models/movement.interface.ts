export interface MovementResponse {
  movementId: number;
  movementDate: string;
  movementType: 'D' | 'R';
  movementValue: number;
  availableBalance: number;
  accountId: number;
}

export interface MovementRequest {
  movementId?: number;
  movementType: 'D' | 'R';
  movementValue: number;
  accountNumber: number;
}

export interface MovementReportResponse {
  movementDate: string;
  identification: string;
  name: string;
  lastname: string;
  accountNumber: number;
  accountType: string;
  initialBalance: number;
  status: boolean;
  movementValue: number;
  availableBalance: number;
}

export type Movement = MovementResponse;
