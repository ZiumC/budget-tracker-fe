import {GetPaymentDto} from "../models/dto/payment.model.dto";
import {subtract} from "./number.util";

export class SortPayment {
  static realCost(items: GetPaymentDto[] | null, ascending: boolean): GetPaymentDto[] | null {
    if (items) {
      return items.sort((prev, next): number => {
        if (ascending) {
          return subtract(prev.price, prev.split).toNumber() -
            subtract(next.price, next.split).toNumber()
        } else {
          return subtract(next.price, next.split).toNumber() -
            subtract(prev.price, prev.split).toNumber()
        }
      })
    } else {
      return null;
    }
  }
}

export class Arrays {
  static onlyUnique(value: any, index: number, array: any): boolean {
    return array.indexOf(value) === index;
  }
}


