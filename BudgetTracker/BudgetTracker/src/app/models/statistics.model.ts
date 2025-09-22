import BigNumber from "bignumber.js";


export class IncomeCategoryDto {
  name: string;
  IncomeSum: BigNumber;
  SavingsSum: BigNumber
}

export class RegularPaymentCategoryDto {
  name: string;
  PriceSum: BigNumber;
  RefundSum: BigNumber
}

export class PlannedPaymentCategoryDto {
  name: string;
  PriceSum: BigNumber;
  EstimatedSum: BigNumber
}

export type GetIncomeStatsDto = Record<string, IncomeCategoryDto>;
export type GetRegularPaymentStatsDto = Record<string, RegularPaymentCategoryDto>;
export type GetPlannedPaymentStatsDto = Record<string, PlannedPaymentCategoryDto>;
