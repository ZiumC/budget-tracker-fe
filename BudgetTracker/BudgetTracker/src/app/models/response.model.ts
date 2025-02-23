export class ResponseModel {
  traceId: string;
  statusCode: number;
  error: ErrorModel;
}

export interface ErrorModel {
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
