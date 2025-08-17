import {
  HorizontalBarDataResult,
  IncomeCategoryDetails,
  PieChartDataResult,
  PlannedPaymentCategoryDetails, RegularPaymentCategoryDetails
} from "../dto/statistics.model.dto";

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

export class BudgetCategoryDetails {
  income: IncomeCategoryDetails[];
  planned: PlannedPaymentCategoryDetails[];
  regular: RegularPaymentCategoryDetails[];
}

export class BudgetLoaders {
  budget: boolean;
  incomeStats: boolean;
  plannedStats: boolean;
  regularStats: boolean;
}
