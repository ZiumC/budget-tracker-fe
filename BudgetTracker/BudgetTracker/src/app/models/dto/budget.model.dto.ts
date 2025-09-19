import BigNumber from "bignumber.js";

export class BudgetDto {
  name: string;
  dateStart: Date;
  dateEnd: Date;
}

export class GetBudgetDto {
  id: string;
  name: string;
  dateEnd: Date;
  dateStart: Date;
}

export class GetBudgetStatsDto {
  plannedPayment: BudgetStatsPlannedPayment;
  regularPayment: BudgetStatsRegularPayment;
  income: BudgetStatsIncome
}

export class GetBudgetGeneralCategoryDto {
  needs: BigNumber;
  wants: BigNumber;
  savings: BigNumber;
}

class BudgetStatsPlannedPayment {
  estimated: BigNumber;
  realPrice: BigNumber;
}

class BudgetStatsRegularPayment {
  price: BigNumber;
  refund: BigNumber;
}

class BudgetStatsIncome {
  wage: BigNumber;
  savings: BigNumber;
}
