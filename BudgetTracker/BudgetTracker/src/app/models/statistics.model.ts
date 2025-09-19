import BigNumber from "bignumber.js";


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
