import {
  IncomeCategoryDetails,
  PlannedPaymentCategoryDetails, RegularPaymentCategoryDetails
} from "../statistics.model";
import {GetBudgetStatsDto} from "../dto/budget.model.dto";
import {HorizontalChartData, PieChartData} from "../charts.model";

export enum StatisticsTab {
  IncomeTab = "incomeTab",
  PlannedPaymentTab = "plannedPaymentTab",
  RegularPaymentTab = "regularPaymentTab"
}

export class StatisticDetails {
  budget: GetBudgetStatsDto;
  income: IncomeCategoryDetails[];
  planned: PlannedPaymentCategoryDetails[];
  regular: RegularPaymentCategoryDetails[];
}

export class DataResult {
  pieChart: PieChartData;
  horizontalChart: HorizontalChartData;
}

export class Loaders {
  budget: boolean;
  statistics: boolean;
}
