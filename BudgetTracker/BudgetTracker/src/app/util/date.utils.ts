import {formatDate} from "@angular/common";
import {DatePickerModel} from "../models/FormModels";

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

  static convertToDatePicker(date: Date): DatePickerModel {
    const formatedDate = this.format(date);
    const splitDate = formatedDate.split("/");
    return {
      year: +splitDate[2],
      month: +splitDate[1],
      day: +splitDate[0],
    } as DatePickerModel;
  }

  static convertToDate(date: DatePickerModel): Date {
    return new Date(date.year, date.month - 1, date.day);
  }
}
