import {add} from "./number.util";
import BigNumber from "bignumber.js";
import { ChartDataResult} from "../models/charts.model";

export function formatPercent(input: string): string {
  return `${input}%`
}

export function getPieChartClassFor(data: ChartDataResult[], isMobileView: boolean): string {
  if (data.length > 0 && data.length <= 8) {
    return isMobileView ? 'mobile-height-m' : 'doughnut-height-s';
  } else if (data.length > 8 && data.length <= 15) {
    return isMobileView ? 'mobile-height-m' : 'doughnut-height-m';
  } else if (data.length > 15) {
    return isMobileView ? 'mobile-height-m' : 'doughnut-height-l';
  } else {
    return '';
  }
}

export function getPieChartGridClassFor(isMobileView: boolean): string {
  return isMobileView ? 'doughnut-height-m' : 'mobile-height-m';
}

export function computePercent(moneyCategory: number, chartData: ChartDataResult[]): BigNumber {
  let totalMoney = new BigNumber(0);
  for (let money of chartData) {
    totalMoney = add(totalMoney, new BigNumber(money.value));
  }
  return new BigNumber((moneyCategory / totalMoney.toNumber()) * 100);
}



