import {GetBudgetSummaryDto} from "../../../models/dto/budget.model.dto";
import {ChartDataResult, LineChartResult} from "../../../models/charts.model";
import BigNumber from "bignumber.js";

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

export class BudgetPaymentSummary {
  private static createSeries(budgets: GetBudgetSummaryDto[], seriesType: SeriesType): ChartDataResult[] {
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

  static toLineChart(budgetsSummary: GetBudgetSummaryDto[] | null, chartType: PaymentChartType): LineChartResult[] {
    let result: LineChartResult[] = [];

    if (budgetsSummary){
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
          seriesResult1 = BudgetPaymentSummary.createSeries(budgetsSummary, seriesType1);
          seriesResult2 = BudgetPaymentSummary.createSeries(budgetsSummary, seriesType2);
          seriesResult3 = BudgetPaymentSummary.createSeries(budgetsSummary, seriesType3);
          break;
        case PaymentChartType.REGULAR_PAYMENTS:
          seriesType1 = SeriesType.PRICE;
          seriesType2 = SeriesType.REFUND;
          seriesType3 = SeriesType.REGULAR_PAID;
          seriesResult1 = BudgetPaymentSummary.createSeries(budgetsSummary, seriesType1);
          seriesResult2 = BudgetPaymentSummary.createSeries(budgetsSummary, seriesType2);
          seriesResult3 = BudgetPaymentSummary.createSeries(budgetsSummary, seriesType3);
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
