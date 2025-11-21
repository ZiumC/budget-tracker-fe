import BigNumber from "bignumber.js";
import {GetBudgetStatisticsSummaryDto} from "../models/dto/budget.model.dto";
import {add, subtract} from "./number.util";

export class BudgetIncome {
  static computeWage(budgetSummaryDto: GetBudgetStatisticsSummaryDto | null): BigNumber {
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

  static computeSavings(budgetSummaryDto: GetBudgetStatisticsSummaryDto | null): BigNumber {
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

  static computeTotal(budgetSummaryDto: GetBudgetStatisticsSummaryDto | null): BigNumber {
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
  static computeEstimated(budgetSummaryDto: GetBudgetStatisticsSummaryDto | null): BigNumber {
    if (!budgetSummaryDto) {
      return new BigNumber(0);
    }

    const budgetPlanned = budgetSummaryDto.plannedPayment;
    if (!budgetPlanned) {
      return new BigNumber(0);
    }

    return new BigNumber(budgetPlanned.estimated);
  }

  static computeRealPrice(budgetSummaryDto: GetBudgetStatisticsSummaryDto | null): BigNumber {
    if (!budgetSummaryDto) {
      return new BigNumber(0);
    }

    const budgetPlanned = budgetSummaryDto.plannedPayment;
    if (!budgetPlanned) {
      return new BigNumber(0);
    }

    return new BigNumber(budgetPlanned.realPrice);
  }

  static computeTotal(budgetSummaryDto: GetBudgetStatisticsSummaryDto | null): BigNumber {
    return BudgetPlannedPayment.computeEstimated(budgetSummaryDto);
  }
}

export class BudgetRegularPayment {
  static computePrice(budgetSummaryDto: GetBudgetStatisticsSummaryDto | null) {
    if (!budgetSummaryDto) {
      return new BigNumber(0);
    }

    const budgetRegular = budgetSummaryDto.regularPayment;
    if (!budgetRegular) {
      return new BigNumber(0);
    }

    return new BigNumber(budgetRegular.price);
  }

  static computeRefund(budgetSummaryDto: GetBudgetStatisticsSummaryDto | null) {
    if (!budgetSummaryDto) {
      return new BigNumber(0);
    }

    const budgetRegular = budgetSummaryDto.regularPayment;
    if (!budgetRegular) {
      return new BigNumber(0);
    }

    return new BigNumber(budgetRegular.refund);
  }

  static computeTotal(budgetSummaryDto: GetBudgetStatisticsSummaryDto | null) {
    const regularPrice = BudgetRegularPayment.computePrice(budgetSummaryDto);
    const regularRefund = BudgetRegularPayment.computeRefund(budgetSummaryDto);

    return subtract(regularPrice, regularRefund).abs();
  }
}

