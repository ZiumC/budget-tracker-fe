import {ResponseModel} from "../response.model";
import {ChartDataResult, LineChartResult} from "../charts.model";

export enum IncomeStatisticsTab {
  BudgetTab = 'BudgetTab',
  SurplusTab = 'SurplusTab'
}

export enum PaymentStatisticsTab {
  RegularTab = 'RegularTab',
  PlannedTab = 'PlannedTab'
}

export class Loaders {
  page: boolean;
  budgets: boolean;
  budgetSummary: boolean;
  budgetCategories: boolean;
}

export class DashboardResponse {
  budgets: ResponseModel;
  budget: ResponseModel;
  budgetSummary: ResponseModel;
  budgetCategories: ResponseModel;
}

export class DataResult {
  budgetWage: LineChartResult[];
  budgetSurplus: LineChartResult[];
  plannedPayments: LineChartResult[];
  regularPayments: LineChartResult[];
  budgetCategories: ChartDataResult[];
}
