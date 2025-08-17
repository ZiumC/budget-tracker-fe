import {
  GetCategoryStatsDto,
  HorizontalBarDataResult, IncomeCategoryDetails,
  PieChartDataResult, PlannedPaymentCategoryDetails, RegularPaymentCategoryDetails,
  StatisticsDataResult
} from "../models/dto/statistics.model.dto";
import {add, subtract} from "./number.util";
import BigNumber from "bignumber.js";
import {BudgetPieChartData} from "../models/components/budget.component";

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


export function transformToIncomeDetails(data: GetCategoryStatsDto | null): IncomeCategoryDetails[] {
  let result: IncomeCategoryDetails[] = [];
  if (data) {
    Object.entries(data).forEach(([key, value]): void => {
      if ('IncomeSum' in value && 'SavingsSum' in value) {
        result.push({
          name: key,
          SavingsSum: value.SavingsSum,
          IncomeSum: value.IncomeSum
        } as IncomeCategoryDetails);
      }
    });
  }
  return result;
}

export function transformToRegularDetails(data: GetCategoryStatsDto | null): RegularPaymentCategoryDetails[] {
  let result: RegularPaymentCategoryDetails[] = [];
  if (data) {
    Object.entries(data).forEach(([key, value]): void => {
      if ('PriceSum' in value && 'RefundSum' in value) {
        result.push({
          name: key,
          PriceSum: value.PriceSum,
          RefundSum: value.RefundSum
        } as RegularPaymentCategoryDetails);
      }
    });
  }
  return result;
}

export function transformToPlannedDetails(data: GetCategoryStatsDto | null): PlannedPaymentCategoryDetails[] {
  let result: PlannedPaymentCategoryDetails[] = [];
  if (data) {
    Object.entries(data).forEach(([key, value]): void => {
      if ('PriceSum' in value && 'EstimatedSum' in value) {
        result.push({
          name: key,
          PriceSum: value.PriceSum,
          EstimatedSum: value.EstimatedSum
        } as PlannedPaymentCategoryDetails);
      }
    });
  }
  return result;
}

export function transformIncomeToPieChartData(incomeDetails: IncomeCategoryDetails[]): PieChartDataResult[] {
  let result: PieChartDataResult[] = [];
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

export function transformRegularPaymentToPieChartData(regularDetails: RegularPaymentCategoryDetails[]): PieChartDataResult[] {
  let result: PieChartDataResult[] = [];
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
    } as PieChartDataResult)
  }

  return result;
}


export function transformPlannedPaymentToPieChartData(plannedDetails: PlannedPaymentCategoryDetails[]): PieChartDataResult[] {
  let result: PieChartDataResult[] = [];

  for (let plannedDetail of plannedDetails) {
    result.push({
      name: plannedDetail.name,
      value: new BigNumber(plannedDetail.EstimatedSum).toNumber()
    });
  }

  return result;
}


// export function transformToPieChartDataResult(data: GetCategoryStatsDto | null): PieChartDataResult[] {
//   let result: PieChartDataResult[] = [];
//   if (data) {
//     let totalSavings = new BigNumber(0);
//     let totalRefund = new BigNumber(0);
//
//     Object.entries(data).forEach(([key, value]): void => {
//       if ('IncomeSum' in value && 'SavingsSum' in value) {
//         totalSavings = add(new BigNumber(totalSavings), new BigNumber(value.SavingsSum));
//         result.push({
//           name: key,
//           value: subtract(new BigNumber(value.IncomeSum), new BigNumber(value.SavingsSum)).toNumber()
//         } as PieChartDataResult);
//       } else if ('PriceSum' in value && 'RefundSum' in value) {
//         totalRefund = add(new BigNumber(totalRefund), new BigNumber(value.RefundSum));
//         result.push({
//           name: key,
//           value: subtract(new BigNumber(value.PriceSum), new BigNumber(value.RefundSum)).toNumber()
//         } as PieChartDataResult);
//       } else if ('PriceSum' in value && 'EstimatedSum' in value) {
//         result.push({
//           name: key,
//           value: subtract(new BigNumber(value.EstimatedSum), BigNumber(value.PriceSum)).abs().toNumber()
//         } as PieChartDataResult);
//       }
//     });
//
//     if (totalSavings.toNumber() > 0) {
//       result.push({
//         name: 'Savings',
//         value: totalSavings.toNumber()
//       } as PieChartDataResult);
//     }
//
//     if (totalRefund.toNumber() > 0) {
//       result.push({
//         name: 'Refund',
//         value: totalRefund.toNumber()
//       } as PieChartDataResult)
//     }
//   }
//   return result;
// }

export function transformToHorizontalChartDataResult(data: BudgetPieChartData): HorizontalBarDataResult[] {
  let result: HorizontalBarDataResult[] = [];
  const moneySpend = calculateMoneySpend(data.regular, data.planned);
  const incomeLeft = calculateIncomeLeft(data.income);

  if (moneySpend && incomeLeft) {
    result.push({
      name: 'Budget',
      series: [
        {
          name: "money spend",
          value: moneySpend.toNumber(),
        },
        {
          name: "money left",
          value: incomeLeft.toNumber() < 0 ? 0 : incomeLeft.toNumber(),
        }
      ]
    } as HorizontalBarDataResult)
  }
  return result;
}

function calculateIncomeLeft(incomeData: PieChartDataResult[]): BigNumber | null {
  let result = null;
  if (incomeData) {
    let totalIncome = new BigNumber(0);

    for (let income of incomeData) {
      totalIncome = add(totalIncome, new BigNumber(income.value))
    }

    result = totalIncome;
  }
  return result;
}

function calculateMoneySpend(regularData: PieChartDataResult[], plannedData: PieChartDataResult[]): BigNumber | null {
  let result = null;
  if (regularData && plannedData) {
    let totalRegularPrice = new BigNumber(0);
    let totalPlannedPrice = new BigNumber(0);

    for (let regular of regularData) {
      totalPlannedPrice = add(totalRegularPrice, new BigNumber(regular.value));
    }

    for (let planned of plannedData) {
      totalPlannedPrice = add(totalPlannedPrice, new BigNumber(planned.value));
    }

    result = add(totalRegularPrice, totalPlannedPrice);
  }
  return result;
}



