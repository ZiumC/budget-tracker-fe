import {IncomeModel, PaymentModel} from "../models/RequestModels";

export class SortIncome {
  static surplusFirst(items: IncomeModel[] | null) {
    if (items) {
      return items.sort(
        ({isSurplus: stateA = false}, {isSurplus: stateB = false}) =>
          Number(stateB) - Number(stateA)
      )
    } else {
      return null;
    }
  }

}

export class SortPayment {
  static paidFirst(items: PaymentModel[] | null) {
    if (items) {
      return items.sort(
        ({isPaid: stateA = false}, {isPaid: stateB = false}) =>
          Number(stateB) - Number(stateA)
      )
    } else {
      return null;
    }
  }
}


