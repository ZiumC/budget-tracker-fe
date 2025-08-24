import BigNumber from "bignumber.js";

export class StatisticsDataResult {
  name: string;
  value: number;
}

export class PieChartDataResult extends StatisticsDataResult {
}

export class HorizontalBarDataResult {
  name: string;
  series: StatisticsDataResult[];
}

export class IncomeCategoryDetails {
  name: string;
  IncomeSum: BigNumber;
  SavingsSum: BigNumber
}

export class RegularPaymentCategoryDetails {
  name: string;
  PriceSum: BigNumber;
  RefundSum: BigNumber
}

export class PlannedPaymentCategoryDetails {
  name: string;
  PriceSum: BigNumber;
  EstimatedSum: BigNumber
}


export type GetIncomeStatsDto = Record<string, IncomeCategoryDetails>;
export type GetRegularPaymentStatsDto = Record<string, RegularPaymentCategoryDetails>;
export type GetPlannedPaymentStatsDto = Record<string, PlannedPaymentCategoryDetails>;
