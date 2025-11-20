import {
  ChartDataResult,
  HorizontalBarDataResult,
} from "../charts.model";

export enum BudgetTab {
  IncomeTab = "incomeTab",
  PlannedPaymentTab = "plannedPaymentTab",
  RegularPaymentTab = "regularPaymentTab"
}


export class DataResult {
  pieChart: PieChartData;
  pieChartGrid: PieChartGridData;
  horizontalChart: HorizontalChartData;
}

export class Loaders {
  budget: boolean;
  incomeCategories: boolean;
  regularPaymentCategories: boolean;
  plannedPaymentCategories: boolean;
  budgetGeneralCategories: boolean;
  budgetSummary: boolean;
}

export class PieChartData {
  income: ChartDataResult[];
  planned: ChartDataResult[];
  regular: ChartDataResult[];
}

export class HorizontalChartData {
  moneyLeftData: HorizontalBarDataResult[];
}

export class PieChartGridData{
  generalCategories: ChartDataResult[];
}
