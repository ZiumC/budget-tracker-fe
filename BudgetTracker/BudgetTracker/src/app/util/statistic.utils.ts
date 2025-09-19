import {GetBudgetGeneralCategoryDto, GetBudgetStatsDto} from "../models/dto/budget.model.dto";
import {
  GetIncomeStatsDto,
  GetPlannedPaymentStatsDto,
  GetRegularPaymentStatsDto
} from "../models/statistics.model";

export enum StatisticType {
  BUDGET = 'budget',
  BUDGET_GENERAL_CATEGORIES = 'general category',
  INCOME = 'income',
  PLANNED_PAYMENT = 'planned payment',
  REGULAR_PAYMENT = 'regular payment',
  UNKNOWN = 'unknown'
}

export function getStatisticType(
  data: GetBudgetStatsDto |
    GetBudgetGeneralCategoryDto |
    GetIncomeStatsDto |
    GetRegularPaymentStatsDto |
    GetPlannedPaymentStatsDto |
    null): StatisticType {

  let result: StatisticType = StatisticType.UNKNOWN;
  if (data) {
    if (data.hasOwnProperty('needs')
      && data.hasOwnProperty('wants')
      && data.hasOwnProperty('savings')) {
      return StatisticType.BUDGET_GENERAL_CATEGORIES;
    } else if (data.hasOwnProperty('income')
      && data.hasOwnProperty('plannedPayment')
      && data.hasOwnProperty('regularPayment')) {
      return StatisticType.BUDGET;
    } else {
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
  }
  return result;
}
