import {RequestParamModel} from "../../models/RequestParamModel";

export class UrlApi {
  private static HOST: string = "https://localhost:7139/api"
  private static CONTOLLERS = {
    BUDGET: "/Budgets",
    PAYMENTS: "/Payments",
    INCOMES: "/Incomes"
  }
  private static ACTIONS = {
    PAYMENTS: "/payments",
    INCOMES: "/incomes",
    INCOME: "/income"
  }

  static budgets(requestParamModel: RequestParamModel): string {
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

  static budget(idBudget: string): string {
    return this.HOST + this.CONTOLLERS.BUDGET + "/" + idBudget;
  }

  static budgetIncomes(
    requestParamModel: RequestParamModel,
    idBudget: string): string {

    let baseUrl = this.HOST + this.CONTOLLERS.BUDGET + "/" + idBudget + this.ACTIONS.INCOMES;

    const page = requestParamModel.page;
    const pageSize = requestParamModel.pageSize;
    const fromDate = requestParamModel.fromDate;
    const toDate = requestParamModel.toDate;
    const orderBy = requestParamModel.orderBy;

    baseUrl = baseUrl + "?page=" + page + "&pageSize=" + pageSize;

    if (fromDate) {
      baseUrl = baseUrl + "&fromDate=" + fromDate;
    }

    if (toDate) {
      baseUrl = baseUrl + "&toDate=" + toDate;
    }

    if (orderBy) {
      baseUrl = baseUrl + "&orderBy=" + orderBy;
    }

    return baseUrl;
  }

  static budgetPayments(
    requestParamModel: RequestParamModel,
    idBudget: string): string {
    const page = requestParamModel.page;
    const pageSize = requestParamModel.pageSize;
    const fromDate = requestParamModel.fromDate;
    const toDate = requestParamModel.toDate;
    const orderBy = requestParamModel.orderBy;

    let urlResult = this.HOST + this.CONTOLLERS.BUDGET + "/" + idBudget + this.ACTIONS.PAYMENTS +
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

  static budgetIncome(idBudget: string): string {
    return this.HOST + this.CONTOLLERS.BUDGET + "/" + idBudget + this.ACTIONS.INCOME;
  }

  static income(idIncome: string): string {
    return this.HOST + this.CONTOLLERS.INCOMES + "/" + idIncome;
  }
}
