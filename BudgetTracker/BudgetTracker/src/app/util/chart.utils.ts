import {
  GetIncomeStatsDto, GetPlannedPaymentStatsDto, GetRegularPaymentStatsDto,
  IncomeCategoryDto, PlannedPaymentCategoryDto, RegularPaymentCategoryDto
} from "../models/statistics.model";
import {add, subtract} from "./number.util";
import BigNumber from "bignumber.js";
import {HorizontalBarDataResult, ChartDataResult} from "../models/charts.model";
import {GetBudgetGeneralCategoryDto, GetBudgetStatisticsSummaryDto} from "../models/dto/budget.model.dto";

export function formatPercent(input: string): string {
  return `${input}%`
}

export function getPieChartClassFor(data: ChartDataResult[], isMobileView: boolean): string {
  if (data.length > 0 && data.length <= 8) {
    return isMobileView ? 'mobile-doughnut-height' : 'doughnut-height-s';
  } else if (data.length > 8 && data.length <= 15) {
    return isMobileView ? 'mobile-doughnut-height' : 'doughnut-height-m';
  } else if (data.length > 15) {
    return isMobileView ? 'mobile-doughnut-height' : 'doughnut-height-l';
  } else {
    return '';
  }
}

export function getPieChartGridClassFor(isMobileView: boolean): string {
  return isMobileView ? 'doughnut-height-m' : 'mobile-doughnut-height';
}

export function transformToIncomeDto(data: GetIncomeStatsDto | null): IncomeCategoryDto[] {
  let result: IncomeCategoryDto[] = [];
  if (data) {
    Object.entries(data).forEach(([key, value]): void => {
      if ('IncomeSum' in value && 'SavingsSum' in value) {
        result.push({
          name: key,
          SavingsSum: value.SavingsSum,
          IncomeSum: value.IncomeSum
        } as IncomeCategoryDto);
      }
    });
  }
  return result;
}

export function transformToRegularDto(data: GetRegularPaymentStatsDto | null): RegularPaymentCategoryDto[] {
  let result: RegularPaymentCategoryDto[] = [];
  if (data) {
    Object.entries(data).forEach(([key, value]): void => {
      if ('PriceSum' in value && 'RefundSum' in value) {
        result.push({
          name: key,
          PriceSum: value.PriceSum,
          RefundSum: value.RefundSum
        } as RegularPaymentCategoryDto);
      }
    });
  }
  return result;
}

export function transformToPlannedDto(data: GetPlannedPaymentStatsDto | null): PlannedPaymentCategoryDto[] {
  let result: PlannedPaymentCategoryDto[] = [];
  if (data) {
    Object.entries(data).forEach(([key, value]): void => {
      if ('PriceSum' in value && 'EstimatedSum' in value) {
        result.push({
          name: key,
          PriceSum: value.PriceSum,
          EstimatedSum: value.EstimatedSum
        } as PlannedPaymentCategoryDto);
      }
    });
  }
  return result;
}

export function incomeToPieChartData(incomeDetails: IncomeCategoryDto[]): ChartDataResult[] {
  let result: ChartDataResult[] = [];
  let totalSavings = new BigNumber(0);

  for (let incomeDetail of incomeDetails) {
    totalSavings = add(new BigNumber(totalSavings), new BigNumber(incomeDetail.SavingsSum));
    result.push({
      name: incomeDetail.name,
      value: subtract(new BigNumber(incomeDetail.IncomeSum), new BigNumber(incomeDetail.SavingsSum)).toNumber()
    });
  }

  if (totalSavings.toNumber() > 0) {
    result.push({
      name: 'Savings',
      value: totalSavings.toNumber()
    });
  }

  return result;
}

export function regularPaymentToPieChartData(regularDetails: RegularPaymentCategoryDto[]): ChartDataResult[] {
  let result: ChartDataResult[] = [];
  let totalRefund = new BigNumber(0);

  for (let regularDetail of regularDetails) {
    totalRefund = add(new BigNumber(totalRefund), new BigNumber(regularDetail.RefundSum));
    result.push({
      name: regularDetail.name,
      value: subtract(new BigNumber(regularDetail.PriceSum), new BigNumber(regularDetail.RefundSum)).toNumber()
    });
  }

  if (totalRefund.toNumber() > 0) {
    result.push({
      name: 'Refund',
      value: totalRefund.toNumber()
    } as ChartDataResult)
  }

  return result;
}

export function plannedPaymentToPieChartData(plannedDetails: PlannedPaymentCategoryDto[]): ChartDataResult[] {
  let result: ChartDataResult[] = [];

  for (let plannedDetail of plannedDetails) {
    result.push({
      name: plannedDetail.name,
      value: new BigNumber(plannedDetail.EstimatedSum).toNumber()
    });
  }

  return result;
}

export function budgetUsageToHorizontalChartData(data: GetBudgetStatisticsSummaryDto | null): HorizontalBarDataResult[] {
  let result: HorizontalBarDataResult[] = [];

  if (data) {
    const moneySpend = add(new BigNumber(data.regularPayment.paid), new BigNumber(data.plannedPayment.paid));
    const onlyIncomes = subtract(new BigNumber(data.income.wage), new BigNumber(data.income.savings));
    const incomeLeft = add(subtract(onlyIncomes, moneySpend), new BigNumber(data.income.budgetSurplus));
    result.push({
      name: 'Budget',
      series: [
        {
          name: "Money spend",
          value: moneySpend.toNumber(),
        },
        {
          name: "Money left",
          value: incomeLeft.toNumber() < 0 ? 0 : incomeLeft.toNumber(),
        },
        {
          name: "Overuse",
          value: incomeLeft.toNumber() < 0 ? incomeLeft.abs().toNumber() : 0,
        }
      ]
    } as HorizontalBarDataResult)
  }

  return result;
}

export function generalCategoriesToPieChartGrid(data: GetBudgetGeneralCategoryDto | null): ChartDataResult[] {
  let result: ChartDataResult[] = [];

  if (data) {
    result.push({
        name: "Needs",
        value: new BigNumber(data.needs).toNumber()
      } as ChartDataResult,
      {
        name: "Wants",
        value: new BigNumber(data.wants).toNumber()
      } as ChartDataResult,
      {
        name: "Savings",
        value: new BigNumber(data.savings).toNumber()
      } as ChartDataResult)
  }

  return result;
}

export function computePercent(moneyCategory: number, chartData: ChartDataResult[]): BigNumber {
  let totalMoney = new BigNumber(0);
  for (let money of chartData) {
    totalMoney = add(totalMoney, new BigNumber(money.value));
  }
  return new BigNumber((moneyCategory / totalMoney.toNumber()) * 100);
}



