import {GetBudgetSummaryDto} from "../../../models/dto/budget.model.dto";
import {ChartDataResult, LineChartResult} from "../../../models/charts.model";
import BigNumber from "bignumber.js";
import {GetIncomeStatsDto} from "../../../models/statistics.model";
import {add, subtract} from "../../number.util";

enum SeriesType {
  WAGE = 'Wage',
  WAGE_SURPLUS = 'Budget surplus',
  SAVINGS = 'Savings',
  SAVINGS_SURPLUS = "Savings surplus"
}

export enum IncomeChartType {
  WAGE_AND_SURPLUS = 'wage and savings',
  SAVINGS_AND_SURPLUS = 'savings and surplus'
}

class ChartLineUtil {
  static createSeries(budgets: GetBudgetSummaryDto[], seriesType: SeriesType): ChartDataResult[] {
    let seriesResult: ChartDataResult[] = [];

    for (let budget of budgets) {
      let value: BigNumber;
      switch (seriesType) {
        case SeriesType.SAVINGS:
          value = budget.statistics.income.savings;
          break;
        case SeriesType.SAVINGS_SURPLUS:
          value = budget.statistics.income.savingsSurplus;
          break;
        case SeriesType.WAGE:
          value = budget.statistics.income.wage;
          break;
        case SeriesType.WAGE_SURPLUS:
          value = budget.statistics.income.budgetSurplus;
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

export class BudgetIncomeSummary {
  static toPieChartData(incomes: GetIncomeStatsDto | null): ChartDataResult[] {
    let result: ChartDataResult[] = [];
    let totalSavings = new BigNumber(0);

    if (incomes) {
      Object.entries(incomes).forEach(([key, value]): void => {
        if ('IncomeSum' in value && 'SavingsSum' in value) {
          totalSavings = add(new BigNumber(totalSavings), new BigNumber(value.SavingsSum));

          let chartValue: number;
          let incomeSum = new BigNumber(value.IncomeSum);
          let savingsSum = new BigNumber(value.SavingsSum);

          if (incomeSum.toNumber() > 0) {
            chartValue = subtract(incomeSum, savingsSum).toNumber();
          } else {
            chartValue = savingsSum.toNumber();
          }

          result.push({
            name: key,
            value: chartValue
          });
        } else {
          throw Error("Unsupported income type " + incomes);
        }
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

  static toLineChart(budgetsSummary: GetBudgetSummaryDto[] | null, chartType: IncomeChartType): LineChartResult[] {
    let result: LineChartResult[] = [];

    if (budgetsSummary) {
      let seriesType1: SeriesType;
      let seriesType2: SeriesType;
      let seriesResult1: ChartDataResult[] = [];
      let seriesResult2: ChartDataResult[] = [];

      switch (chartType) {
        case IncomeChartType.WAGE_AND_SURPLUS:
          seriesType1 = SeriesType.WAGE;
          seriesType2 = SeriesType.WAGE_SURPLUS;
          seriesResult1 = ChartLineUtil.createSeries(budgetsSummary, seriesType1);
          seriesResult2 = ChartLineUtil.createSeries(budgetsSummary, seriesType2);
          break;
        case IncomeChartType.SAVINGS_AND_SURPLUS:
          seriesType1 = SeriesType.SAVINGS;
          seriesType2 = SeriesType.SAVINGS_SURPLUS;
          seriesResult1 = ChartLineUtil.createSeries(budgetsSummary, seriesType1);
          seriesResult2 = ChartLineUtil.createSeries(budgetsSummary, seriesType2);
          break;
        default:
          throw Error(chartType + " is unsupported chart")
      }

      result.push({
        name: seriesType1,
        series: seriesResult1
      } as LineChartResult);

      result.push({
        name: seriesType2,
        series: seriesResult2
      } as LineChartResult);
    }

    return result;
  }
}
