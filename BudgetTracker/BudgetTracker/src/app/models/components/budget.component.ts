import {
  HorizontalBarDataResult,
  IncomeCategoryDetails,
  PieChartDataResult,
  PlannedPaymentCategoryDetails, RegularPaymentCategoryDetails
} from "../dto/statistics.model.dto";
import {GetBudgetStatsDto} from "../dto/budget.model.dto";

export enum BudgetTabs {
  IncomeTab = "incomeTab",
  PlannedPaymentTab = "plannedPaymentTab",
  RegularPaymentTab = "regularPaymentTab"
}

export class BudgetPieChartData {
  income: PieChartDataResult[];
  planned: PieChartDataResult[];
  regular: PieChartDataResult[];
}

export class BudgetHorizontalChartData {
  moneyLeftData: HorizontalBarDataResult[];
}

export class BudgetStatistics {
  budget: GetBudgetStatsDto;
  income: IncomeCategoryDetails[];
  planned: PlannedPaymentCategoryDetails[];
  regular: RegularPaymentCategoryDetails[];
}

export class BudgetLoaders {
  budget: boolean;
  statistics: boolean;
}
