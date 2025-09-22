import {
  IncomeCategoryDto,
  PlannedPaymentCategoryDto, RegularPaymentCategoryDto
} from "../statistics.model";
import {GetBudgetGeneralCategoryDto, GetBudgetSummaryDto} from "../dto/budget.model.dto";
import {HorizontalChartData, PieChartData, PieChartGridData} from "../charts.model";

export enum StatisticsTab {
  IncomeTab = "incomeTab",
  PlannedPaymentTab = "plannedPaymentTab",
  RegularPaymentTab = "regularPaymentTab"
}

export class StatisticsDto {
  budgetSummary: GetBudgetSummaryDto | null;
  generalCategories: GetBudgetGeneralCategoryDto | null;
  income: IncomeCategoryDto[];
  planned: PlannedPaymentCategoryDto[];
  regular: RegularPaymentCategoryDto[];
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
