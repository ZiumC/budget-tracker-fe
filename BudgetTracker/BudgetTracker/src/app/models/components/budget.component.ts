import {HorizontalChartData, PieChartData, PieChartGridData} from "../charts.model";

export enum StatisticsTab {
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
