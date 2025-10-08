import BigNumber from "bignumber.js";
import {GetBudgetSummaryDto} from "../models/dto/budget.model.dto";
import {add, subtract} from "./number.util";

export class BudgetIncome {
  static computeSavings(budgetSummaryDto: GetBudgetSummaryDto | null): BigNumber {
    if (!budgetSummaryDto) {
      return new BigNumber(0);
    }

    const budgetIncome = budgetSummaryDto.income;
    if (!budgetIncome) {
      return new BigNumber(0);
    }

    const savings = new BigNumber(budgetIncome.savings);
    const surplusSavings = new BigNumber(budgetIncome.savingsSurplus);

    return add(savings, surplusSavings);
  }

  static computeWage(budgetSummaryDto: GetBudgetSummaryDto | null): BigNumber {
    if (!budgetSummaryDto) {
      return new BigNumber(0);
    }

    const budgetIncome = budgetSummaryDto.income;
    if (!budgetIncome) {
      return new BigNumber(0);
    }

    const wage = new BigNumber(budgetIncome.wage);
    const budgetSurplus = new BigNumber(budgetIncome.budgetSurplus);

    return add(wage, budgetSurplus);
  }

  static computeTotal(budgetSummaryDto: GetBudgetSummaryDto | null): BigNumber {
    const budgetWage = BudgetIncome.computeWage(budgetSummaryDto);
    const budgetSavings = BudgetIncome.computeSavings(budgetSummaryDto);

    return subtract(budgetWage, budgetSavings);
  }
}

export class BudgetPlannedPayment {
  static computeEstimated(budgetSummaryDto: GetBudgetSummaryDto | null): BigNumber {
    if (!budgetSummaryDto) {
      return new BigNumber(0);
    }

    const budgetPlanned = budgetSummaryDto.plannedPayment;
    if (!budgetPlanned) {
      return new BigNumber(0);
    }

    return new BigNumber(budgetPlanned.estimated);
  }

  static computeRealPrice(budgetSummaryDto: GetBudgetSummaryDto | null): BigNumber {
    if (!budgetSummaryDto) {
      return new BigNumber(0);
    }

    const budgetPlanned = budgetSummaryDto.plannedPayment;
    if (!budgetPlanned) {
      return new BigNumber(0);
    }

    return new BigNumber(budgetPlanned.realPrice);
  }

  static computeTotal(budgetSummaryDto: GetBudgetSummaryDto | null): BigNumber {
    return BudgetPlannedPayment.computeEstimated(budgetSummaryDto);
  }
}

// static function computeBudgetSavings(budgetSummaryDto: GetBudgetSummaryDto | null): BigNumber {
//   if (!budgetSummaryDto){
//     return new BigNumber(0);
//   }
//
//   const budgetIncome = budgetSummaryDto.income;
//   if (!budgetIncome) {
//     return new BigNumber(0);
//   }
//
//   const savings = new BigNumber(budgetIncome.savings);
//   const surplusSavings = new BigNumber(budgetIncome.savingsSurplus);
//
//   return add(savings, surplusSavings);
// }

// export function computeBudgetTotalIncome(budgetSummaryDto: GetBudgetSummaryDto | null): BigNumber {
//   if (!budgetSummaryDto) {
//     return new BigNumber(0);
//   }
//
//   const budgetSavings = computeBudgetSavings(budgetSummaryDto);
//   const budgetIncome = budgetSummaryDto.income;
//   if (!budgetIncome) {
//     return new BigNumber(0);
//   }
//
//   const wage = new BigNumber(budgetIncome.wage);
//   const budgetSurplus = new BigNumber(budgetIncome.budgetSurplus);
//
//   const budgetWage = add(wage, budgetSurplus);
//
//   return subtract(budgetWage, budgetSavings);
// }
