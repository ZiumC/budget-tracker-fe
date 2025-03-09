import {GetPaymentDto} from "../models/dto/payment.model.dto";
import {subtract} from "./number.util";

export class SortPayment {
  static realCost(items: GetPaymentDto[] | null, ascending: boolean): GetPaymentDto[] | null {
    if (items) {
      return items.sort((prev, next): number => {
        if (ascending){
          return subtract(prev.price, prev.refund).toNumber() -
            subtract(next.price, next.refund).toNumber()
        } else {
          return subtract(next.price, next.refund).toNumber() -
            subtract(prev.price, prev.refund).toNumber()
        }
      })
    } else {
      return null;
    }
  }
}


