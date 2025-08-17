import {GetCategoryStatsDto, StatisticsDataResult} from "../models/dto/statistics.model.dto";
import {add, subtract} from "./number.util";
import BigNumber from "bignumber.js";

export function formatPercent(input: string): string {
  return `${input}%`
}

export function getPieChartClassFor(data: StatisticsDataResult[], isMobileView: boolean): string {
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

export function transformToPieChartDataResult(data: GetCategoryStatsDto | null): StatisticsDataResult[] {
  let result: StatisticsDataResult[] = [];
  if (data) {
    let totalSavings = new BigNumber(0);
    let totalRefund = new BigNumber(0);

    Object.entries(data).forEach(([key, value]): void => {
      if ('IncomeSum' in value && 'SavingsSum' in value) {
        totalSavings = add(new BigNumber(totalSavings), new BigNumber(value.SavingsSum));
        result.push({
          name: key,
          value: subtract(new BigNumber(value.IncomeSum), new BigNumber(value.SavingsSum)).toNumber()
        } as StatisticsDataResult);
      } else if ('PriceSum' in value && 'RefundSum' in value) {
        totalRefund = add(new BigNumber(totalRefund), new BigNumber(value.RefundSum));
        result.push({
          name: key,
          value: subtract(new BigNumber(value.PriceSum), new BigNumber(value.RefundSum)).toNumber()
        } as StatisticsDataResult);
      } else if ('PriceSum' in value && 'EstimatedSum' in value) {
        result.push({
          name: key,
          value: new BigNumber(value.PriceSum).toNumber()
        } as StatisticsDataResult);
      }
    });

    if (totalSavings.toNumber() > 0) {
      result.push({
        name: 'Savings',
        value: totalSavings.toNumber()
      } as StatisticsDataResult);
    }

    if (totalRefund.toNumber() > 0) {
      result.push({
        name: 'Refund',
        value: totalRefund.toNumber()
      } as StatisticsDataResult)
    }
  }
  return result;
}

