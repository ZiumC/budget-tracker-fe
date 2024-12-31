import {RequestParamModel} from "../../models/RequestParamModel";

enum UrlApiPart {
  API_HOST = 'https://localhost:7139/api',
  BUDGET_CONTROLLER = "/Budgets",
  PAYMENT_CONTROLLER = "/payments"
}

export class UrlApi {
  private static HOST: string = "https://localhost:7139/api"
  private static CONTOLLERS = {
    BUDGET: "/Budgets",
    PAYMENTS: "/Payments"
  }
  private static ACTIONS = {
    PAYMENTS: "/payments",
    INCOMES: "/incomes"
  }

  static getBudgets(requestParamModel: RequestParamModel): string {
    const page = requestParamModel.page;
    const pageSize = requestParamModel.pageSize;
    const fromDate = requestParamModel.fromDate;
    const toDate = requestParamModel.toDate;
    const orderBy = requestParamModel.orderBy;

    let urlResult = this.HOST + this.CONTOLLERS.BUDGET +
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

  static getBudgetIncomes(
    requestParamModel: RequestParamModel,
    idBudget: string): string {
    const page = requestParamModel.page;
    const pageSize = requestParamModel.pageSize;
    const fromDate = requestParamModel.fromDate;
    const toDate = requestParamModel.toDate;
    const orderBy = requestParamModel.orderBy;

    let urlResult = this.HOST + this.CONTOLLERS.BUDGET + "/" + idBudget + this.ACTIONS.INCOMES +
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
