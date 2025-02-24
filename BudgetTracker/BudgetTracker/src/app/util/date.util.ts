import {formatDate} from "@angular/common";
import {DatePicker} from "../models/datepicker.model";
import {Injectable} from "@angular/core";
import {NgbDateParserFormatter, NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

export class DateUtil {
  static format(date: Date | null | undefined): string {
    if (date) {
      return formatDate(date, 'dd/MM/yyyy', 'pl-PL');
    }
    return '---';
  }

  static formatWithTime(date: Date | null | undefined): string {
    if (date) {
      return formatDate(date, 'dd/MM/yyyy HH:mm', 'pl-PL');
    }
    return '---';
  }

  static firstDayOfCurrentMonth(): Date {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    return new Date(currentYear, currentMonth, 1);
  }

  static lastDayOfCurrentMonth(): Date {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    return new Date(currentYear, currentMonth, 0);
  }

  static firstDayOfCurrentYear(): Date {
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, 0, 1);
  }

  static lastDayOfCurrentYear(): Date {
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, 11, 31);
  }
}

export class DatePickerUtil {
  static convertToDatePicker(date: Date): DatePicker {
    const formatedDate = DateUtil.format(date);
    const splitDate = formatedDate.split("/");
    return {
      year: +splitDate[2],
      month: +splitDate[1],
      day: +splitDate[0],
    } as DatePicker;
  }

  static convertToDate(date: DatePicker): Date {
    return new Date(date.year, date.month - 1, date.day);
  }

  static getMonthName(datePicker: DatePicker): string {
    const convertedDate = this.convertToDate(datePicker);
    return new Date(convertedDate).toLocaleString('default', {month: 'long'});
  }

  static formatDatePicker(datePicker: DatePicker): string {
    const formatedDate = this.convertToDate(datePicker);
    return DateUtil.format(formatedDate);
  }

  static firstDayOfCurrentMonth(): DatePicker {
    return this.convertToDatePicker(DateUtil.firstDayOfCurrentMonth());
  }

  static lastDayOfCurrentMonth(): DatePicker {
    return this.convertToDatePicker(DateUtil.lastDayOfCurrentMonth());
  }

  static firstDayOfCurrentYear(): DatePicker {
    return this.convertToDatePicker(DateUtil.firstDayOfCurrentYear());
  }

  static lastDayOfCurrentYear(): DatePicker {
    return this.convertToDatePicker(DateUtil.lastDayOfCurrentYear());
  }
}

export function isInvalidDate(valueToCheck: Date | DatePicker): boolean {
  let dateToCheck: Date;

  if (valueToCheck instanceof Date) {
    dateToCheck = valueToCheck;
  } else {
    dateToCheck = DatePickerUtil.convertToDate(valueToCheck);
  }

  return isNaN(new Date(dateToCheck).getTime());
}


@Injectable()
export class DatepickerFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (value) {
      const parts = value.split('/');
      return {day: +parts[0], month: +parts[1], year: +parts[2]};
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ? `${this.pad(date.day)}/${this.pad(date.month)}/${date.year}` : '';
  }

  private pad(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
}
