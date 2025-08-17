import BigNumber from "bignumber.js";

export class StatisticsDataResult {
  name: string;
  value: number;
}

export class HorizontalBarDataResult{
  name: string;
  series: StatisticsDataResult[];
}

export class IncomeCategoryDetails {
  IncomeSum: BigNumber;
  SavingsSum: BigNumber
}

export class RegularPaymentCategoryDetails {
  PriceSum: BigNumber;
  RefundSum: BigNumber
}

export class PlannedPaymentCategoryDetails{
  PriceSum: BigNumber;
  EstimatedSum: BigNumber
}

export type GetCategoryStatsDto = Record<string, IncomeCategoryDetails | RegularPaymentCategoryDetails | PlannedPaymentCategoryDetails>;
