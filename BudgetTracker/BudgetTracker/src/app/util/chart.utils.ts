import {
  GetIncomeStatsDto,
  IncomeCategoryDto,
} from "../models/statistics.model";
import {add, subtract} from "./number.util";
import BigNumber from "bignumber.js";
import { ChartDataResult} from "../models/charts.model";
import {
  GetBudgetGeneralCategoryDto,
} from "../models/dto/budget.model.dto";

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



