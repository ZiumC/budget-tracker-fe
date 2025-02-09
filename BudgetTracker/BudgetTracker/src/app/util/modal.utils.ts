import {BudgetStatus} from "../models/modal-models/BudgetStatusModel";

export class ModalUtils {
  public static isUndefinedBudgetStatus(budgetStatus: BudgetStatus): boolean {
    return typeof budgetStatus.status === "undefined" &&
      typeof budgetStatus.message === "undefined"
  }
}
