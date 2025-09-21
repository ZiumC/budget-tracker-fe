import {
  IncomeCategoryDetails,
  PlannedPaymentCategoryDetails, RegularPaymentCategoryDetails
} from "../statistics.model";
import {GetBudgetGeneralCategoryDto, GetBudgetSummaryDto} from "../dto/budget.model.dto";
import {HorizontalChartData, PieChartData, PieChartGridData} from "../charts.model";

export enum StatisticsTab {
  IncomeTab = "incomeTab",
  PlannedPaymentTab = "plannedPaymentTab",
  RegularPaymentTab = "regularPaymentTab"
}

export class StatisticDetails {
  budgetSummary: GetBudgetSummaryDto | null;
  generalCategories: GetBudgetGeneralCategoryDto | null;
  income: IncomeCategoryDetails[];
  planned: PlannedPaymentCategoryDetails[];
  regular: RegularPaymentCategoryDetails[];
}

export class DataResult {
  pieChart: PieChartData;
  pieChartGrid: PieChartGridData;
  horizontalChart: HorizontalChartData;
}

export class Loaders {
  budget: boolean;
  statistics: boolean;
}
