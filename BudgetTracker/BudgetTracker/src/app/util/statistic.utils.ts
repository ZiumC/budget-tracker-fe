import {
  GetIncomeStatsDto,
  GetPlannedPaymentStatsDto,
  GetRegularPaymentStatsDto
} from "../models/statistics.model";

export enum StatisticType {
  INCOME = 'income',
  PLANNED_PAYMENT = 'planned payment',
  REGULAR_PAYMENT = 'regular payment',
  UNKNOWN = 'unknown'
}

export function getStatisticType(
  data: GetIncomeStatsDto |
    GetRegularPaymentStatsDto |
    GetPlannedPaymentStatsDto |
    null): StatisticType {

  let result: StatisticType = StatisticType.UNKNOWN;
  if (data) {
    for (let [key, value] of Object.entries(data)) {
      if ('IncomeSum' in value && 'SavingsSum' in value) {
        return StatisticType.INCOME;
      } else if ('PriceSum' in value && 'RefundSum' in value) {
        return StatisticType.REGULAR_PAYMENT;
      } else if ('PriceSum' in value && 'EstimatedSum' in value) {
        return StatisticType.PLANNED_PAYMENT;
      }
    }
  }
  return result;
}
