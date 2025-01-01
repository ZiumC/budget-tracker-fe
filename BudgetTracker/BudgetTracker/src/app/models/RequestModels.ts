import BigNumber from "bignumber.js";

export class BudgetModel {
  id: string;
  name: string;
  dateEnd: Date;
  dateStart: Date;
}

export class IncomeModel {
  id: string;
  name: string;
  wage: BigNumber;
  isSurplus: boolean;
  dateUpdated: Date;
}

export class PaymentModel {
  id: string;
  name: string;
  price: BigNumber;
  refund: BigNumber;
  isPaid: boolean;
  comment: string;
  dateUpdated: Date;
}
