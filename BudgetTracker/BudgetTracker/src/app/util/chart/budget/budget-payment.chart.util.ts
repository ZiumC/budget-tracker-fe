import {GetBudgetStatisticsSummaryDto, GetBudgetSummaryDto} from "../../../models/dto/budget.model.dto";
import {ChartDataResult, HorizontalBarDataResult, LineChartResult} from "../../../models/charts.model";
import BigNumber from "bignumber.js";
import {add, subtract} from "../../number.util";
import {
  GetPlannedPaymentStatsDto, GetRegularPaymentStatsDto,
  IncomeCategoryDto,
  PlannedPaymentCategoryDto,
  RegularPaymentCategoryDto
} from "../../../models/statistics.model";

enum SeriesType {
  PRICE = 'Price',
  REFUND = 'Refund',
  REGULAR_PAID = 'Paid (regular)',
  ESTIMATED = 'Estimated',
  REAL = 'Real price',
  PLANNED_PAID = 'Paid (planned)'
}

export enum PaymentChartType {
  REGULAR_PAYMENTS = 'wage and savings',
  PLANNED_PAYMENTS = 'savings and surplus'
}

class ChartLineUtil {
  static createSeries(budgets: GetBudgetSummaryDto[], seriesType: SeriesType): ChartDataResult[] {
    let seriesResult: ChartDataResult[] = [];

    for (let budget of budgets) {
      let value: BigNumber;
      switch (seriesType) {
        case SeriesType.PRICE:
          value = budget.statistics.regularPayment.price;
          break;
        case SeriesType.REFUND:
          value = budget.statistics.regularPayment.refund;
          break;
        case SeriesType.REGULAR_PAID:
          value = budget.statistics.regularPayment.paid;
          break;
        case SeriesType.ESTIMATED:
          value = budget.statistics.plannedPayment.estimated;
          break;
        case SeriesType.REAL:
          value = budget.statistics.plannedPayment.realPrice;
          break;
        case SeriesType.PLANNED_PAID:
          value = budget.statistics.plannedPayment.paid;
          break;
        default:
          throw Error(seriesType + ' is unsupported type');
      }
      seriesResult.push({
        name: budget.budgetName,
        value: new BigNumber(value).toNumber()
      } as ChartDataResult);
    }

    return seriesResult;
  }
}

export class BudgetPaymentSummary {
  static toPieChartData(payments: GetPlannedPaymentStatsDto | GetRegularPaymentStatsDto | null): ChartDataResult[] {
    let result: ChartDataResult[] = [];
    let totalRefund = new BigNumber(0);

    if (payments) {
      Object.entries(payments).forEach(([key, value]): void => {
        //regular payment
        if ('PriceSum' in value && 'RefundSum' in value) {
          totalRefund = add(new BigNumber(totalRefund), new BigNumber(value.RefundSum));
          result.push({
            name: key,
            value: subtract(new BigNumber(value.PriceSum), new BigNumber(value.RefundSum)).toNumber()
          } as ChartDataResult);

          //planned payment
        } else if ('PriceSum' in value && 'EstimatedSum' in value) {
          result.push({
            name: key,
            value: new BigNumber(value.EstimatedSum).toNumber()
          } as ChartDataResult);
        } else {
          throw Error("Unsupported type of payment " + payments);
        }
      });

      if (totalRefund.toNumber() > 0) {
        result.push({
          name: 'Refund',
          value: totalRefund.toNumber()
        } as ChartDataResult)
      }
    }
    return result;
  }

  static toHorizontalChart(data: GetBudgetStatisticsSummaryDto | null): HorizontalBarDataResult[] {
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
      } as HorizontalBarDataResult);
    }
    return result;
  }

  static toLineChart(budgetsSummary: GetBudgetSummaryDto[] | null, chartType: PaymentChartType): LineChartResult[] {
    let result: LineChartResult[] = [];

    if (budgetsSummary) {
      let seriesType1: SeriesType;
      let seriesType2: SeriesType;
      let seriesType3: SeriesType;
      let seriesResult1: ChartDataResult[] = [];
      let seriesResult2: ChartDataResult[] = [];
      let seriesResult3: ChartDataResult[] = [];

      switch (chartType) {
        case PaymentChartType.PLANNED_PAYMENTS:
          seriesType1 = SeriesType.ESTIMATED;
          seriesType2 = SeriesType.REAL;
          seriesType3 = SeriesType.PLANNED_PAID;
          seriesResult1 = ChartLineUtil.createSeries(budgetsSummary, seriesType1);
          seriesResult2 = ChartLineUtil.createSeries(budgetsSummary, seriesType2);
          seriesResult3 = ChartLineUtil.createSeries(budgetsSummary, seriesType3);
          break;
        case PaymentChartType.REGULAR_PAYMENTS:
          seriesType1 = SeriesType.PRICE;
          seriesType2 = SeriesType.REFUND;
          seriesType3 = SeriesType.REGULAR_PAID;
          seriesResult1 = ChartLineUtil.createSeries(budgetsSummary, seriesType1);
          seriesResult2 = ChartLineUtil.createSeries(budgetsSummary, seriesType2);
          seriesResult3 = ChartLineUtil.createSeries(budgetsSummary, seriesType3);
          break;
        default:
          throw Error(chartType + ' is unsupported chart');
      }

      result.push({
        name: seriesType1,
        series: seriesResult1
      } as LineChartResult);

      result.push({
        name: seriesType2,
        series: seriesResult2
      } as LineChartResult);

      result.push({
        name: seriesType3,
        series: seriesResult3
      } as LineChartResult);
    }

    return result;
  }
}
