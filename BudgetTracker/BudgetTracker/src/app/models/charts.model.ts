export class ChartDataResult {
  name: string;
  value: number;
}

export class HorizontalBarDataResult {
  name: string;
  series: ChartDataResult[];
}

export class PieChartData {
  income: ChartDataResult[];
  planned: ChartDataResult[];
  regular: ChartDataResult[];
}

export class HorizontalChartData {
  moneyLeftData: HorizontalBarDataResult[];
}

export class PieChartGridData{
  summary: ChartDataResult[];
}
