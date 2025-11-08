import {ErrorModel, ResponseModel} from "../models/response.model";
import {HttpResponse} from "@angular/common/http";

export function getErrorResponse(err: any): ResponseModel {

  const traceId: string = err.headers.get('X-Trace-Id') == undefined ? err.headers.get('x-trace-id') : err.headers.get('X-Trace-Id');
  const statusCode: number = err.status;
  const type: string = err.error["Type"] == undefined ? err.error["type"] : err.error["Type"];
  const message: string = err.error["Message"] == undefined ? err.error["message"] : err.error["Message"];
  const title: string = err.error["Title"] == undefined ? err.error["title"] : err.error["Title"];
  const path: string = err.error["Path"] == undefined ? err.error["path"] : err.error["Path"];
  const errStatusCode: string = err.error["statusCode"] == undefined ? err.error["statusCode"] : err.error["StatusCode"];

  const errorModel: ErrorModel = {
    type: type,
    message: message,
    title: title,
    path: path,
    statusCode: errStatusCode
  };

  return {
    traceId: traceId,
    statusCode: statusCode,
    error: errorModel
  };
}

export function isSuccess(response: HttpResponse<any>): boolean {
  return response.status >= 200 && response.status <= 299
}


