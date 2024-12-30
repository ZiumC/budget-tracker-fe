import {RequestParamModel} from "../../models/RequestParamModel";

enum UrlApiPart {
  API_HOST = 'https://localhost:7139/api',
  BUDGET = "/Budgets"
}

export class UrlApi {
  static getBudgets(requestModel: RequestParamModel) {
     const page = requestModel.page;
     const pageSize = requestModel.pageSize;
     const fromDate = requestModel.fromDate;
     const toDate = requestModel.toDate;
     const orderBy = requestModel.orderBy;

    let urlResult = UrlApiPart.API_HOST + UrlApiPart.BUDGET +
      "?page=" + page + "&pageSize=" + pageSize;

    if (fromDate) {
      urlResult = urlResult + "&fromDate=" + fromDate;
    }

    if (toDate) {
      urlResult = urlResult + "&toDate=" + toDate;
    }

    if (orderBy) {
      urlResult = urlResult + "&orderBy=" + orderBy;
    }

    return urlResult;
  }
}
