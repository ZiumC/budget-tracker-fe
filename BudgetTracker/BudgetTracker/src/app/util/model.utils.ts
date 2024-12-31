import {IncomeModel, PaymentModel} from "../models/RequestModels";

export class Sort {
  static incomeSurplusFirst(items: IncomeModel[] | null) {
    if (items) {
      return items.sort(
        ({isSurplus: stateA = false}, {isSurplus: stateB = false}) =>
          Number(stateB) - Number(stateA)
      )
    } else {
      return null;
    }
  }

  static incomePaidFirst(items: PaymentModel[] | null) {
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
