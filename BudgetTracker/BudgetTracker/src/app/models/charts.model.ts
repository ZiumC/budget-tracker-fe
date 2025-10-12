export class ChartDataResult {
  name: string;
  value: number;
}

export class HorizontalBarDataResult {
  name: string;
  series: ChartDataResult[];
}

export class LineChartResult {
  name: string;
  series: ChartDataResult[];
}
