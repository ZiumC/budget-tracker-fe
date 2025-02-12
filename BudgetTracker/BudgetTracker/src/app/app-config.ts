import {BudgetPickerForm} from "./models/FormModels";
import {DateUtils} from "./util/date.utils";

export class AnimationsConfig {
  public static DEFAULT_DURATION = 500;
}

export class LoadersConfig {
  public static DEFAULT_DURATION = 25;
  public static SHORT_DURATION = 12;
}

export class DateConfig {
  private static CURRENT_YEAR = new Date().getFullYear();
  public static FIRST_DAY_OF_CURRENT_MONTH: Date = new Date(DateConfig.CURRENT_YEAR, new Date().getMonth(), 1);
  public static LAST_DAY_OF_CURRENT_MONTH: Date = new Date(DateConfig.CURRENT_YEAR, new Date().getMonth() + 1, 0);
  public static FIRST_DAY_OF_CURRENT_YEAR: Date = new Date(DateConfig.CURRENT_YEAR, 0, 1);
  public static LAST_DAY_OF_CURRENT_YEAR: Date = new Date(DateConfig.CURRENT_YEAR, 11, 31);
}

export class DatePickerConfig {
  public static DEFAULT_FORM_PICKER: BudgetPickerForm = {
    name: "",
    dateStart: DateUtils.convertToDatePicker(DateConfig.FIRST_DAY_OF_CURRENT_MONTH),
    dateEnd: DateUtils.convertToDatePicker(DateConfig.LAST_DAY_OF_CURRENT_MONTH)
  };
}

export class DateMessageConfig {
  public static MONTHS_MESSAGE: string = 'Months in both dates should be equal.';
  public static YEARS_MESSAGE: string = 'Years in both dates should be equal.';
  public static RANGE_MESSAGE: string = 'Date range is invalid.';
  public static MONTH_ALREADY_EXIST_MESSAGE: string = 'Month already defined.';
}

export class RequestConfig {
  public static OK_CODE = 200;
  public static BUDGETS_DEFAULT_PAGE = 1;
  public static BUDGETS_DEFAULT_PAGE_SIZE = 36;
}

export class CookieNames {
  public static FROM_DATE = 'from-date';
  public static TO_DATE = 'to-date';
}
