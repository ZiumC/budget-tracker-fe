import {RequestModel} from "../../models/request.model";
import {CategoryType} from "../../models/dto/category.model.dto";
import {LoginDto} from "../../models/dto/user.model.dto";


class HostUrl {
  private static host = 'https://localhost:7139'
  private static api = '/api'

  static getHostUrl(): string {
    return HostUrl.host + HostUrl.api;
  }
}

class ParamsQuery {
  static getDateRangeQuery(requestParam: RequestModel): string {
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

  static getOrderQuery(requestParam: RequestModel): string {
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

  static getPaginationQuery(requestParam: RequestModel): string {
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
    requestParam: RequestModel | null,
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
    requestParam: RequestModel,
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

  static budgets(requestParam: RequestModel): string {
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

export class StatisticUrls {
  private static CONTROLLER = '/Statistics';
  private static ACTIONS = {
    BUDGET: "/budget",
    INCOMES: "/incomes",
    REGULAR_PAYMENTS: "/payments",
    PLANNED_PAYMENTS: "/payments/planned",
    GENERAL_CATEGORIES: "/categories"
  }

  static budgetStats(idBudget: string): string {
    let result = HostUrl.getHostUrl() + StatisticUrls.CONTROLLER;
    return result + StatisticUrls.ACTIONS.BUDGET + "/" + idBudget;
  }

  static budgetStatsInRange(requestParams: RequestModel): string {
    let queryResult = HostUrl.getHostUrl() + StatisticUrls.CONTROLLER +
      StatisticUrls.ACTIONS.BUDGET + "?";
    const fromDate = requestParams.fromDate;
    const toDate = requestParams.toDate;

    if (fromDate) {
      queryResult = queryResult + "fromDate=" + fromDate;
    }

    if (toDate) {
      queryResult = queryResult + "&toDate=" + toDate;
    }

    return queryResult;
  }

  static budgetIncomeStats(idBudget: string): string {
    let result = HostUrl.getHostUrl() + StatisticUrls.CONTROLLER + StatisticUrls.ACTIONS.BUDGET;
    return result + "/" + idBudget + StatisticUrls.ACTIONS.INCOMES;
  }

  static budgetRegularPaymentStats(idBudget: string): string {
    let result = HostUrl.getHostUrl() + StatisticUrls.CONTROLLER + StatisticUrls.ACTIONS.BUDGET;
    return result + "/" + idBudget + StatisticUrls.ACTIONS.REGULAR_PAYMENTS;
  }

  static budgetPlannedPaymentStats(idBudget: string): string {
    let result = HostUrl.getHostUrl() + StatisticUrls.CONTROLLER + StatisticUrls.ACTIONS.BUDGET;
    return result + "/" + idBudget + StatisticUrls.ACTIONS.PLANNED_PAYMENTS;
  }

  static budgetGeneralCategories(idBudget: string): string {
    let result = HostUrl.getHostUrl() + StatisticUrls.CONTROLLER + StatisticUrls.ACTIONS.BUDGET;
    return result + "/" + idBudget + StatisticUrls.ACTIONS.GENERAL_CATEGORIES;
  }

  static budgetGeneralCategoriesInRange(requestParams: RequestModel): string {
    let queryResult = HostUrl.getHostUrl() + StatisticUrls.CONTROLLER +
      StatisticUrls.ACTIONS.BUDGET + StatisticUrls.ACTIONS.GENERAL_CATEGORIES + "?";
    const fromDate = requestParams.fromDate;
    const toDate = requestParams.toDate;

    if (fromDate) {
      queryResult = queryResult + "fromDate=" + fromDate;
    }

    if (toDate) {
      queryResult = queryResult + "&toDate=" + toDate;
    }
    return queryResult;
  }
}

export class CategoryUrls {
  private static CONTROLLER = "/Categories";
  private static ACTIONS = {
    PAYMENT: "/payment",
    INCOME: "/income",
  }

  static paymentCategory(type: string | null, requestParam: RequestModel | null): string {
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

  static incomeCategory(requestParam: RequestModel | null): string {
    let result = HostUrl.getHostUrl() + CategoryUrls.CONTROLLER;
    result = result + CategoryUrls.ACTIONS.INCOME;

    if (requestParam) {
      let orderQuery = ParamsQuery.getOrderQuery(requestParam);
      if (orderQuery) {
        result = result + "?" + orderQuery;
      }

      let paginationQuery = ParamsQuery.getPaginationQuery(requestParam);
      if (paginationQuery) {
        result = result + "&" + paginationQuery;
      }
    }
    return result;
  }

  static paymentCategoryId(idCategory: string): string {
    let result = HostUrl.getHostUrl() + CategoryUrls.CONTROLLER;
    return result + CategoryUrls.ACTIONS.PAYMENT + "/" + idCategory;
  }

  static incomeCategoryId(idIncome: string): string {
    let result = HostUrl.getHostUrl() + CategoryUrls.CONTROLLER;
    return result + CategoryUrls.ACTIONS.INCOME + "/" + idIncome;
  }
}

export class IncomeUrls {
  private static CONTROLLER = "/Incomes";
  private static ACTIONS = {
    ASSIGNMENT: "/assignment"
  }

  static incomeId(idIncome: string): string {
    return HostUrl.getHostUrl() + IncomeUrls.CONTROLLER + "/" + idIncome;
  }

  static incomeAssignment(idIncome: string): string {
    return HostUrl.getHostUrl() + IncomeUrls.CONTROLLER + "/" + idIncome + IncomeUrls.ACTIONS.ASSIGNMENT;
  }
}

export class PaginationUrls {
  private static CONTROLLER = "/Pagination";
  private static ACTIONS = {
    BUDGET: "/budget",
    CATEGORIES: "/categories",
  }
  private static SUB_ACTIONS = {
    PAYMENT: "/payment",
    REGULAR_PAYMENTS: "/payments",
    PLANNED_PAYMENTS: "/payments/planned",
    INCOMES: "/incomes",
    INCOME: "/income"
  }

  static regularPaymentsPagination(idBudget: string, requestParam: RequestModel): string {
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

  static incomesPagination(idBudget: string, requestParam: RequestModel): string {
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

  static plannedPaymentsPagination(idBudget: string, requestParam: RequestModel): string {
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

  static paymentCategories(type: CategoryType, requestParam: RequestModel): string {
    let result = HostUrl.getHostUrl() + PaginationUrls.CONTROLLER;
    result = result + PaginationUrls.ACTIONS.CATEGORIES + PaginationUrls.SUB_ACTIONS.PAYMENT;
    return result + "?type=" + type.valueOf() + "&pageSize=" + requestParam.pageSize;
  }

  static incomeCategories(requestParam: RequestModel): string {
    let result = HostUrl.getHostUrl() + PaginationUrls.CONTROLLER;
    result = result + PaginationUrls.ACTIONS.CATEGORIES + PaginationUrls.SUB_ACTIONS.INCOME;
    return result + "?pageSize=" + requestParam.pageSize;
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

export class AuthUrls {
  private static CONTROLLER = "/Auth";
  private static ACTIONS = {
    LOGOUT: "/jwt/revoke",
    LOGIN: "/login",
    ME: "/me"
  }

  static login(): string {
    return HostUrl.getHostUrl() + AuthUrls.CONTROLLER + AuthUrls.ACTIONS.LOGIN;
  }

  static logout(): string {
    return HostUrl.getHostUrl() + AuthUrls.CONTROLLER + AuthUrls.ACTIONS.LOGOUT;
  }

  static loginStatus(): string {
    return HostUrl.getHostUrl() + AuthUrls.CONTROLLER + AuthUrls.ACTIONS.ME;
  }
}
