import {ChartDataResult} from "../../../models/charts.model";
import BigNumber from "bignumber.js";
import {GetBudgetGeneralCategoryDto} from "../../../models/dto/budget.model.dto";

export class BudgetSummary {
  static toPieChartGrid(categories: GetBudgetGeneralCategoryDto | null): ChartDataResult[] {
    let result: ChartDataResult[] = [];

    if (categories) {
      result.push({
          name: "Needs",
          value: new BigNumber(categories.needs).toNumber()
        } as ChartDataResult,
        {
          name: "Wants",
          value: new BigNumber(categories.wants).toNumber()
        } as ChartDataResult,
        {
          name: "Savings",
          value: new BigNumber(categories.savings).toNumber()
        } as ChartDataResult)
    }
    return result;
  }
}
