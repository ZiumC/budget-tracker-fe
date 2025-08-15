import BigNumber from "bignumber.js";

export class StatisticsDataResult {
  name: string;
  value: number;
}

export class IncomeCategoryDetails {
  IncomeSum: BigNumber;
  SavingsSum: BigNumber
}

export class PaymentCategoryDetails {
  PriceSum: BigNumber;
  RefundSum: BigNumber
}

export type GetCategoryStatsDto = Record<string, IncomeCategoryDetails | PaymentCategoryDetails>;
