import BigNumber from "bignumber.js";
import {GetBudgetSummaryDto} from "../models/dto/budget.model.dto";
import {add, subtract} from "./number.util";

export class BudgetIncome {
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

  static computeTotal(budgetSummaryDto: GetBudgetSummaryDto | null): BigNumber {
    const budgetWage = BudgetIncome.computeWage(budgetSummaryDto);
    if (!budgetSummaryDto) {
      return new BigNumber(0);
    }

    const budgetIncome = budgetSummaryDto.income;
    if (!budgetIncome) {
      return new BigNumber(0);
    }

    const savings = new BigNumber(budgetIncome.savings);

    return subtract(budgetWage, savings);
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

export class BudgetRegularPayment {
  static computePrice(budgetSummaryDto: GetBudgetSummaryDto | null) {
    if (!budgetSummaryDto) {
      return new BigNumber(0);
    }

    const budgetRegular = budgetSummaryDto.regularPayment;
    if (!budgetRegular) {
      return new BigNumber(0);
    }

    return new BigNumber(budgetRegular.price);
  }

  static computeRefund(budgetSummaryDto: GetBudgetSummaryDto | null) {
    if (!budgetSummaryDto) {
      return new BigNumber(0);
    }

    const budgetRegular = budgetSummaryDto.regularPayment;
    if (!budgetRegular) {
      return new BigNumber(0);
    }

    return new BigNumber(budgetRegular.refund);
  }

  static computeTotal(budgetSummaryDto: GetBudgetSummaryDto | null) {
    const regularPrice = BudgetRegularPayment.computePrice(budgetSummaryDto);
    const regularRefund = BudgetRegularPayment.computeRefund(budgetSummaryDto);

    return subtract(regularPrice, regularRefund);
  }
}

