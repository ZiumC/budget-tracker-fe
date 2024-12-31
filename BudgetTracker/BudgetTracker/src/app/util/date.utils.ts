import {formatDate} from "@angular/common";

export class DateUtils {
  static format(date: Date | null | undefined) {
    if (date) {
      return formatDate(date, 'dd/MM/yyyy', 'pl-PL');
    }
    return '---';
  }

  static formatWithTime(date: Date | null | undefined) {
    if (date) {
      return formatDate(date, 'dd/MM/yyyy HH:mm', 'pl-PL');
    }
    return '---';
  }
}
