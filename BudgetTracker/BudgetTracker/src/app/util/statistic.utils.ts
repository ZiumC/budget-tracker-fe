import {GetBudgetStatsDto} from "../models/dto/budget.model.dto";
import {
  GetIncomeStatsDto,
  GetPlannedPaymentStatsDto,
  GetRegularPaymentStatsDto
} from "../models/dto/statistics.model.dto";

export enum StatisticType {
  BUDGET = 'budget',
  INCOME = 'income',
  PLANNED_PAYMENT = 'planned payment',
  REGULAR_PAYMENT = 'regular payment',
  UNKNOWN = 'unknown'
}

export function getStatisticType(
  data: GetBudgetStatsDto |
    GetIncomeStatsDto |
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
      } else {
        return StatisticType.BUDGET;
      }
    }
  }
  return result;
}
