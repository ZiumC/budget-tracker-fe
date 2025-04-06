import {RequestParams} from "../../models/requestParams";

export enum TotalPages {
  INCOMES = "incomes",
  PAYMENTS = "payments",
  PLANNED_PAYMENTS = "payments/planned"
}

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
    BUDGET: "/budget",
    PLANNED: "/planned"
  }

  static budgets(requestParamModel: RequestParams): string {
    const page = requestParamModel.page;
    const pageSize = requestParamModel.pageSize;
    const fromDate = requestParamModel.fromDate;
    const toDate = requestParamModel.toDate;
    const orderBy = requestParamModel.orderBy;
    const order = requestParamModel.order;

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

    if (order) {
      urlResult = urlResult + "&order=" + order;
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
    requestParam: RequestParams,
    idBudget: string): string {

    let baseUrl = this.budgetId(idBudget) + this.ACTIONS.INCOMES;

    const page = requestParam.page;
    const pageSize = requestParam.pageSize;
    const fromDate = requestParam.fromDate;
    const toDate = requestParam.toDate;
    const orderBy = requestParam.orderBy;
    const order = requestParam.order;

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

    if (order) {
      baseUrl = baseUrl + "&order=" + order;
    }

    return baseUrl;
  }

  static budgetPayments(requestParam: RequestParams,
                        idBudget: string): string {
    const page = requestParam.page;
    const pageSize = requestParam.pageSize;
    const fromDate = requestParam.fromDate;
    const toDate = requestParam.toDate;
    const orderBy = requestParam.orderBy;
    const order = requestParam.order;

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

    if (order) {
      urlResult = urlResult + "&order=" + order;
    }

    return urlResult;
  }

  static budgetPlannedPayment(requestParam: RequestParams,
                              idBudget: string): string {
    const page = requestParam.page;
    const pageSize = requestParam.pageSize;
    const fromDate = requestParam.fromDate;
    const toDate = requestParam.toDate;
    const orderBy = requestParam.orderBy;
    const order = requestParam.order;

    let urlResult = this.budgetId(idBudget) + this.ACTIONS.PAYMENTS + this.ACTIONS.PLANNED +
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

    if (order) {
      urlResult = urlResult + "&order=" + order;
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

  static paymentStatus(idPayment: string): string {
    return this.paymentController() + "/" + idPayment + "/status";
  }

  static budgetDataPages(requestParam: RequestParams,
                         idBudget: string,
                         action: TotalPages): string {
    const pageSize = requestParam.pageSize;
    const fromDate = requestParam.fromDate;
    const toDate = requestParam.toDate;

    let urlResult = this.paginationController() +
      this.ACTIONS.BUDGET + "/" + idBudget + "/" + action + "?pageSize=" + pageSize;

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
