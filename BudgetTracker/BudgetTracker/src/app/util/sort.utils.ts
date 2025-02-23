import {GetIncomeDto} from "../models/dto/income.model.dto";
import {GetPaymentDto} from "../models/dto/payment.model.dto";

export class SortIncome {
  static surplusFirst(items: GetIncomeDto[] | null): GetIncomeDto[] | null {
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
  static paidFirst(items: GetPaymentDto[] | null): GetPaymentDto[] | null {
    if (items) {
      return items.sort(
        ({isPaid: stateA = false}, {isPaid: stateB = false}): number =>
          Number(stateB) - Number(stateA)
      )
    } else {
      return null;
    }
  }
}


