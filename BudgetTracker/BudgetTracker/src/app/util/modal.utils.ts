import {BudgetStatus} from "../models/modal-models/BudgetStatusModel";
import {NgModel} from "@angular/forms";

export class ModalUtils {
  public static isUndefinedBudgetStatus(budgetStatus: BudgetStatus): boolean {
    return typeof budgetStatus.status === "undefined" &&
      typeof budgetStatus.message === "undefined"
  }

  public static displayMarginFor(model: NgModel): string {
    if (model.invalid && (model.dirty || model.touched)) {
      return 'mb-1 pb-1'
    } else if (model.valid) {
      return 'mb-3 pb-3'
    } else {
      return 'mb-4 pb-2'
    }
  }
}
