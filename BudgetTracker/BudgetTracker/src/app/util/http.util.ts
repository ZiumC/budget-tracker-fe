import {ErrorModel, ResponseModel} from "../models/response.model";
import {HttpResponse} from "@angular/common/http";

export function getErrorResponse(err: any): ResponseModel {
  return {
    traceId: err.headers.get('X-Trace-Id'),
    statusCode: err.status,
    error: {
      type: err.error["type"],
      message: err.error["message"],
      title: err.error["title"],
      path: err.error["path"],
      statusCode: err.error["statusCode"],
    } as ErrorModel
  } as ResponseModel;
}

export function isSuccess(response: HttpResponse<any>): boolean {
  return response.status >= 200 && response.status <= 299
}


