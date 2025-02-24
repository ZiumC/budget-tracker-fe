import {ResponseModel} from "../models/response.model";
import {HttpResponse} from "@angular/common/http";

export function generateErrorModel(err: any): ResponseModel {
  return {
    traceId: err.headers.get('X-Trace-Id'),
    statusCode: err.status,
    error: err.error
  } as ResponseModel;
}

export function isSuccess(response: HttpResponse<any>): boolean {
  return response.status >= 200 && response.status <= 299
}


