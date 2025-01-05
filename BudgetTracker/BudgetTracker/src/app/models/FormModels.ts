import BigNumber from "bignumber.js";

export class IncomeForm {
  name: string;
  wage: BigNumber;
  isSurplus: boolean;
}

export class PaymentForm {
  name: string;
  price: BigNumber;
  refund: BigNumber;
  isPaid: boolean;
  comment?: string;
}

export class BudgetForm {
  name: string;
  dateStart: Date;
  dateEnd: Date;
}
