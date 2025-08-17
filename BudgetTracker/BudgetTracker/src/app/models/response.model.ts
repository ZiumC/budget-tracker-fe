export class ResponseModel {
  traceId: string;
  statusCode: number;
  error: ErrorModel;
}

export class ErrorModel {
  title: string;
  type: string;
  path: string;
  message: string;
  statusCode: string;
}

export class IndexResponse {
  budgets: ResponseModel;
  budget: ResponseModel;
}

export class BudgetResponse {
  budget: ResponseModel;
  incomes: ResponseModel;
  payments: ResponseModel;
  paymentStatus: ResponseModel;
  budgetStats: ResponseModel;
  incomeStats: ResponseModel;
  regularPaymentStats: ResponseModel;
  plannedPaymentStats: ResponseModel;
}

export class Status {
  isSuccess: boolean;
  title: string;
  message: string;
}
