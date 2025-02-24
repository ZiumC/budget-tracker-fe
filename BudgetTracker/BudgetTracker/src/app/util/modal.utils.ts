import {BudgetStatus} from "../models/modal/budget.model.modal";
import {NgModel} from "@angular/forms";
import {NgbModalOptions} from "@ng-bootstrap/ng-bootstrap/modal/modal-config";

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

  public static defaultSettings(...val: boolean[]): void {
    for (let index = 0; index < val.length; index++) {
      val[index] = false;
    }
  }
}

export class ModalOptions {

  static default(ms?: ModalSize): NgbModalOptions {
    let size: string;
    switch (ms) {
      case ModalSize.SMALL:
        size = 'sm';
        break;
      case ModalSize.MEDIUM:
        size = 'md';
        break;
      case ModalSize.BIG:
        size = 'lg';
        break;
      default:
        size = 'md';
        break;
    }

    return {
      centered: true,
      scrollable: true,
      size: size,
      backdrop: 'static',
      keyboard: false,
    } as NgbModalOptions;
  }
}

export enum ModalSize {
  SMALL,
  MEDIUM,
  BIG,
}
