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

export class PaymentStatusForm {
  isPaid: boolean;
}

export class BudgetPickerForm {
  name: string;
  dateStart: DatePicker;
  dateEnd: DatePicker;
}

export class DatePicker {
  year: number;
  month: number;
  day: number;
}

export class BudgetDateForm {
  name: string;
  dateStart: Date;
  dateEnd: Date;
}
