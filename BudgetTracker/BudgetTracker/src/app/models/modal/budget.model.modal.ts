import {DatePicker} from "../datepicker.model";

export class BudgetStatus {
  status: boolean;
  message: string;
}

export class BudgetDatePicker {
  name: string;
  dateStart: DatePicker;
  dateEnd: DatePicker;
}
