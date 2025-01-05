import {formatDate} from "@angular/common";

export class DateUtils {
  static format(date: Date | null | undefined): string {
    if (date) {
      return formatDate(date, 'dd/MM/yyyy', 'pl-PL');
    }
    return '---';
  }

  static formatWithCustomFormatter(date: Date, formatter: string): string {
    return formatDate(date, formatter, 'pl-PL');
  }

  static formatWithTime(date: Date | null | undefined): string {
    if (date) {
      return formatDate(date, 'dd/MM/yyyy HH:mm', 'pl-PL');
    }
    return '---';
  }
}
