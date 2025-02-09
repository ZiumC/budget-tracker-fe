import {formatDate} from "@angular/common";
import {DatePicker} from "../models/FormModels";

export class DateUtils {
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

  static convertToDatePicker(date: Date): DatePicker {
    const formatedDate = this.format(date);
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
    return this.format(formatedDate);
  }
}
