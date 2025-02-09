import {BudgetPickerForm} from "./models/FormModels";
import {DateUtils} from "./util/date.utils";

export class AnimationsConfig {
  public static DEFAULT_DURATION = 500;
}

export class LoadersConfig {
  public static DEFAULT_DURATION = 25;
  public static SHORT_DURATION = 12;
}

export class DatesConfig {
  public static MONTHS_MESSAGE: string = 'Months in both dates should be equal.';
  public static YEARS_MESSAGE: string = 'Years in both dates should be equal.';
  public static RANGE_MESSAGE: string = 'Date range is invalid.';
  public static FIRST_DAY: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  public static LAST_DAY: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  public static DEFAULT_PICKER: BudgetPickerForm = {
    name: "",
    dateStart: DateUtils.convertToDatePicker(DatesConfig.FIRST_DAY),
    dateEnd: DateUtils.convertToDatePicker(DatesConfig.LAST_DAY)
  };
}
