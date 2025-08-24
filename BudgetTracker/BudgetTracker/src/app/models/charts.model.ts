export class StatisticsDataResult {
  name: string;
  value: number;
}

export class PieChartDataResult extends StatisticsDataResult {
}

export class HorizontalBarDataResult {
  name: string;
  series: StatisticsDataResult[];
}

export class PieChartData {
  income: PieChartDataResult[];
  planned: PieChartDataResult[];
  regular: PieChartDataResult[];
}

export class HorizontalChartData {
  moneyLeftData: HorizontalBarDataResult[];
}
