import {RequestParams} from "../../models/requestParams";
import {CategoryType} from "../../models/dto/category.model.dto";


class HostUrl {
  private static host = 'https://localhost:7139'
  private static api = '/api'

  static getHostUrl(): string {
    return HostUrl.host + HostUrl.api;
  }
}

class ParamsQuery {
  static getDateRangeQuery(requestParam: RequestParams): string {
    let queryResult: string = "";
    const fromDate = requestParam.fromDate;
    const toDate = requestParam.toDate;

    if (fromDate) {
      queryResult = queryResult + "fromDate=" + fromDate;
    }

    if (toDate) {
      queryResult = queryResult + "&toDate=" + toDate;
    }

    return queryResult;
  }

  static getOrderQuery(requestParam: RequestParams): string {
    let queryResult: string = "";
    const orderBy = requestParam.orderBy;
    const order = requestParam.order;

    if (orderBy) {
      queryResult = queryResult + "orderBy=" + orderBy;
    }

    if (order) {
      queryResult = queryResult + "&order=" + order;
    }

    return queryResult;
  }

  static getPaginationQuery(requestParam: RequestParams): string {
    let queryResult: string = "";
    const page = requestParam.page;
    const pageSize = requestParam.pageSize;

    if (page) {
      queryResult = queryResult + "page=" + page;
    }

    if (pageSize) {
      queryResult = queryResult + "&pageSize=" + pageSize;
    }

    return queryResult;
  }
}

export class BudgetUrls {
  private static CONTROLLER = '/Budgets';
  private static ACTIONS = {
    REGULAR_PAYMENTS: "/payments",
    PLANNED_PAYMENTS: "/payments/planned",
    INCOMES: "/incomes",
    REGULAR_PAYMENT: "/payment",
    INCOME: "/income"
  }

  static budgetPayments(
    idBudget: string,
    requestParam: RequestParams | null,
    isPlanned: boolean): string {

    let result = HostUrl.getHostUrl() + BudgetUrls.CONTROLLER;
    let actionPart: string = "";

    if (isPlanned) {
      actionPart = BudgetUrls.ACTIONS.PLANNED_PAYMENTS;
    } else {
      actionPart = BudgetUrls.ACTIONS.REGULAR_PAYMENTS;
    }
    result = result + "/" + idBudget + actionPart;

    if (requestParam) {
      result = result + "?";
      let orderQuery = ParamsQuery.getOrderQuery(requestParam);
      if (orderQuery) {
        result = result + orderQuery;
      }
      let paginationQuery = ParamsQuery.getPaginationQuery(requestParam);
      if (paginationQuery) {
        result = result + "&" + paginationQuery;
      }
    }

    return result;
  }

  static budgetIncomes(
    requestParam: RequestParams,
    idBudget: string): string {

    let result = HostUrl.getHostUrl() + BudgetUrls.CONTROLLER + "/" + idBudget;
    result = result + BudgetUrls.ACTIONS.INCOMES + "?";

    let orderQuery = ParamsQuery.getOrderQuery(requestParam);
    if (orderQuery) {
      result = result + orderQuery;
    }

    let paginationQuery = ParamsQuery.getPaginationQuery(requestParam);
    if (paginationQuery) {
      result = result + "&" + paginationQuery;
    }

    return result;
  }

  static budgetId(idBudget: string): string {
    return HostUrl.getHostUrl() + BudgetUrls.CONTROLLER + "/" + idBudget;
  }

  static budgets(requestParam: RequestParams): string {
    let result = HostUrl.getHostUrl() + BudgetUrls.CONTROLLER + "?";

    let dateRangeQuery = ParamsQuery.getDateRangeQuery(requestParam);
    if (dateRangeQuery) {
      result = result + dateRangeQuery;
    }

    let orderQuery = ParamsQuery.getOrderQuery(requestParam);
    if (orderQuery) {
      result = result + "&" + orderQuery;
    }

    let paginationQuery = ParamsQuery.getPaginationQuery(requestParam);
    if (paginationQuery) {
      result = result + "&" + paginationQuery;
    }

    return result;
  }

  static budgetIncome(idBudget: string): string {
    let result = HostUrl.getHostUrl() + BudgetUrls.CONTROLLER + "/" + idBudget;
    return result + BudgetUrls.ACTIONS.INCOME;
  }

  static budgetPayment(idBudget: string): string {
    let result = HostUrl.getHostUrl() + BudgetUrls.CONTROLLER + "/" + idBudget;
    return result + BudgetUrls.ACTIONS.REGULAR_PAYMENT;
  }

  static budgetDate(budgetDate: string): string {
    let result = HostUrl.getHostUrl() + BudgetUrls.CONTROLLER;
    return result + "?budgetDate=" + budgetDate
  }
}

export class CategoryUrls {
  private static CONTROLLER = "/Categories";
  private static ACTIONS = {
    PAYMENT: "/payment",
  }

  static paymentCategory(type: string | null, requestParam: RequestParams | null): string {
    let result = HostUrl.getHostUrl() + CategoryUrls.CONTROLLER;
    result = result + CategoryUrls.ACTIONS.PAYMENT;

    if (type) {
      result = result + "?type=" + type;
    }

    if (requestParam) {
      let orderQuery = ParamsQuery.getOrderQuery(requestParam);
      if (orderQuery) {
        result = result + "&" + orderQuery;
      }

      let paginationQuery = ParamsQuery.getPaginationQuery(requestParam);
      if (paginationQuery) {
        result = result + "&" + paginationQuery;
      }
    }

    return result;
  }

  static paymentId(idPayment: string): string {
    let result = HostUrl.getHostUrl() + CategoryUrls.CONTROLLER;
    return result + CategoryUrls.ACTIONS.PAYMENT + "/" + idPayment;
  }
}

export class IncomeUrls {
  private static CONTROLLER = "/Incomes";

  static incomeId(idIncome: string): string {
    return HostUrl.getHostUrl() + IncomeUrls.CONTROLLER + "/" + idIncome;
  }
}

export class PaginationUrls {
  private static CONTROLLER = "/Pagination";
  private static ACTIONS = {
    BUDGET: "/budget",
    CATEGORIES: "/categories",
  }
  private static SUB_ACTIONS = {
    REGULAR_PAYMENTS: "/payments",
    PLANNED_PAYMENTS: "/payments/planned",
    INCOMES: "/incomes"
  }

  static regularPaymentsPagination(idBudget: string, requestParam: RequestParams): string {
    let result = HostUrl.getHostUrl() + PaginationUrls.CONTROLLER;
    result = result + PaginationUrls.ACTIONS.BUDGET + "/" + idBudget;
    result = result + PaginationUrls.SUB_ACTIONS.REGULAR_PAYMENTS;
    result = result + "?pageSize=" + requestParam.pageSize;

    let dateRangeQuery = ParamsQuery.getDateRangeQuery(requestParam);
    if (dateRangeQuery) {
      result = result + "&" + dateRangeQuery;
    }

    return result;
  }

  static incomesPagination(idBudget: string, requestParam: RequestParams): string {
    let result = HostUrl.getHostUrl() + PaginationUrls.CONTROLLER;
    result = result + PaginationUrls.ACTIONS.BUDGET + "/" + idBudget;
    result = result + PaginationUrls.SUB_ACTIONS.INCOMES;
    result = result + "?pageSize=" + requestParam.pageSize;

    let dateRangeQuery = ParamsQuery.getDateRangeQuery(requestParam);
    if (dateRangeQuery) {
      result = result + "&" + dateRangeQuery;
    }

    return result;
  }

  static plannedPaymentsPagination(idBudget: string, requestParam: RequestParams): string {
    let result = HostUrl.getHostUrl() + PaginationUrls.CONTROLLER;
    result = result + PaginationUrls.ACTIONS.BUDGET + "/" + idBudget;
    result = result + PaginationUrls.SUB_ACTIONS.PLANNED_PAYMENTS;
    result = result + "?pageSize=" + requestParam.pageSize;

    let dateRangeQuery = ParamsQuery.getDateRangeQuery(requestParam);
    if (dateRangeQuery) {
      result = result + "&" + dateRangeQuery;
    }

    return result;
  }

  static paymentCategories(type: CategoryType, requestParam: RequestParams): string {
    let result = HostUrl.getHostUrl() + PaginationUrls.CONTROLLER;
    result = result + PaginationUrls.ACTIONS.CATEGORIES;
    return result + "?type=" + type.valueOf() + "&pageSize=" + requestParam.pageSize;
  }
}

export class PaymentUrls {
  private static CONTROLLER = "/Payments";
  private static ACTIONS = {
    STATUS: "/status",
    ASSIGNMENT: "/assignment",
    PLANNED: "/planned",
  }

  static paymentId(idPayment: string, isPlanned: boolean): string {
    let result = HostUrl.getHostUrl() + PaymentUrls.CONTROLLER + "/" + idPayment;

    if (isPlanned) {
      result = result + PaymentUrls.ACTIONS.PLANNED
    }

    return result;
  }

  static paymentStatus(idPayment: string, isPlanned: boolean): string {
    return PaymentUrls.paymentId(idPayment, isPlanned) + PaymentUrls.ACTIONS.STATUS;
  }

  static paymentAssignment(idPayment: string, isPlanned: boolean): string {
    return PaymentUrls.paymentId(idPayment, isPlanned) + PaymentUrls.ACTIONS.ASSIGNMENT;
  }
}
