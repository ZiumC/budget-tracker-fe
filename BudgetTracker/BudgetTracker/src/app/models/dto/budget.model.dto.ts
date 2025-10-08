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

export class GetBudgetSummaryDto {
  plannedPayment: BudgetSummaryPlannedPayment;
  regularPayment: BudgetSummaryRegularPayment;
  income: BudgetSummaryIncome
}

export class GetBudgetGeneralCategoryDto {
  needs: BigNumber;
  wants: BigNumber;
  savings: BigNumber;
}

class BudgetSummaryPlannedPayment {
  estimated: BigNumber;
  realPrice: BigNumber;
  paid: BigNumber;
}

class BudgetSummaryRegularPayment {
  price: BigNumber;
  refund: BigNumber;
  paid: BigNumber;
}

class BudgetSummaryIncome {
  wage: BigNumber;
  savings: BigNumber;
  budgetSurplus: BigNumber;
  savingsSurplus: BigNumber;
}
