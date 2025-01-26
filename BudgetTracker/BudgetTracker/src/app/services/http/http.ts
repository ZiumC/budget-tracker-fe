import {RequestParamModel} from "../../models/RequestParamModel";

export class UrlApi {
  private static HOST: string = "https://localhost:7139/api"
  private static CONTROLLERS = {
    BUDGETS: "/Budgets",
    PAYMENTS: "/Payments",
    INCOMES: "/Incomes",
    PAGINATION: "/Pagination"
  }
  private static ACTIONS = {
    PAYMENTS: "/payments",
    PAYMENT: "/payment",
    INCOMES: "/incomes",
    INCOME: "/income",
    BUDGETS: "/budgets",
    BUDGET: "/budget"
  }

  static budgets(requestParamModel: RequestParamModel): string {
    const page = requestParamModel.page;
    const pageSize = requestParamModel.pageSize;
    const fromDate = requestParamModel.fromDate;
    const toDate = requestParamModel.toDate;
    const orderBy = requestParamModel.orderBy;

    let urlResult = this.budgetController() +
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

  static budgetsPages(pageSize: number): string {
    return this.paginationController() +
      this.ACTIONS.BUDGETS + "?pageSize=" + pageSize
  }

  static budgetId(idBudget: string): string {
    return this.budgetController() + "/" + idBudget
  }

  static budgetDate(budgetDate: string): string {
    return this.budgetController() + "?budgetDate=" + budgetDate
  }

  static budgetIncomes(
    requestParam: RequestParamModel,
    idBudget: string): string {

    let baseUrl = this.budgetId(idBudget) + this.ACTIONS.INCOMES;

    const page = requestParam.page;
    const pageSize = requestParam.pageSize;
    const fromDate = requestParam.fromDate;
    const toDate = requestParam.toDate;
    const orderBy = requestParam.orderBy;

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

  static budgetPayments(requestParam: RequestParamModel,
                        idBudget: string): string {
    const page = requestParam.page;
    const pageSize = requestParam.pageSize;
    const fromDate = requestParam.fromDate;
    const toDate = requestParam.toDate;
    const orderBy = requestParam.orderBy;

    let urlResult = this.budgetId(idBudget) + this.ACTIONS.PAYMENTS +
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
    return this.budgetId(idBudget) + this.ACTIONS.INCOME;
  }

  static incomeId(idIncome: string): string {
    return this.incomeController() + "/" + idIncome;
  }

  static budgetPayment(idBudget: string): string {
    return this.budgetId(idBudget) + this.ACTIONS.PAYMENT;
  }

  static paymentId(idPayment: string): string {
    return this.paymentController() + "/" + idPayment;
  }

  static paginationIncomes(requestParam: RequestParamModel,
                           idBudget: string): string {
    const pageSize = requestParam.pageSize;
    const fromDate = requestParam.fromDate;
    const toDate = requestParam.toDate;

    let urlResult = this.paginationController() +
      this.ACTIONS.BUDGET + "/" + idBudget + "/incomes?pageSize=" + pageSize;

    if (fromDate) {
      urlResult = urlResult + "&fromDate=" + fromDate;
    }

    if (toDate) {
      urlResult = urlResult + "&toDate=" + toDate;
    }

    return urlResult;
  }

  private static budgetController(): string {
    return this.HOST + this.CONTROLLERS.BUDGETS;
  }

  private static paymentController(): string {
    return this.HOST + this.CONTROLLERS.PAYMENTS;
  }

  private static incomeController(): string {
    return this.HOST + this.CONTROLLERS.INCOMES;
  }

  private static paginationController(): string {
    return this.HOST + this.CONTROLLERS.PAGINATION;
  }
}
