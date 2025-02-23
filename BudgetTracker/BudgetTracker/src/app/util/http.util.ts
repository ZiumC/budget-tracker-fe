import {ResponseModel} from "../models/response.model";

export function generateErrorModel(err: any): ResponseModel {
  return {
    traceId: err.headers.get('X-Trace-Id'),
    statusCode: err.status,
    error: err.error
  } as ResponseModel;
}


