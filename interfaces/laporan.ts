export interface DailyData {
  timeLabel: string;
  prevTimeLabel: string;

  isLiburCurrent: boolean;
  alasanLiburCurrent?: string;
  isLiburPrevious: boolean;
  alasanLiburPrevious?: string;

  revenueCurrent: number[];
  revenuePrevious: number[];
  revenueLabels: string[];

  totalRevenueCurrent: number;
  totalRevenuePrevious: number;

  portionCurrent: number;
  portionPrevious: number;

  dineInCurrent: number;
  takeawayCurrent: number;
  dineInPrevious: number;
  takeawayPrevious: number;

  dineInTrend?: number[];
  takeawayTrend?: number[];
  dineInPreviousTrend?: number[];
  takeawayPreviousTrend?: number[];

  cuacaCurrent: string[];
  cuacaPrevious: string[];

  cuacaCurrentStats?: {
    cerah: number;
    mendung: number;
    gerimis: number;
    hujan: number;
  };
  cuacaPreviousStats?: {
    cerah: number;
    mendung: number;
    gerimis: number;
    hujan: number;
  };

  weatherLogsCurrent?: { timeRange: string; weather: string }[];
  weatherLogsPrevious?: { timeRange: string; weather: string }[];
}

export interface AggregatedData {
  timeLabel: string;
  prevTimeLabel: string;

  labels: string[];
  revenueCurrentTrend: number[];
  revenuePreviousTrend: number[];
  portionCurrentTrend: number[];
  portionPreviousTrend: number[];

  weatherCurrentTrend?: string[];
  weatherPreviousTrend?: string[];
  weatherLogsCurrentTrend?: { timeRange: string; weather: string }[][];
  weatherLogsPreviousTrend?: { timeRange: string; weather: string }[][];
  isLiburCurrentTrend?: boolean[];
  isLiburPreviousTrend?: boolean[];
  alasanLiburCurrentTrend?: string[];
  alasanLiburPreviousTrend?: string[];

  totalRevenueCurrent: number;
  totalRevenuePrevious: number;

  totalPortionCurrent: number;
  totalPortionPrevious: number;

  dineInCurrent: number;
  takeawayCurrent: number;
  dineInPrevious: number;
  takeawayPrevious: number;

  totalLiburCurrent?: number;
  alasanLiburCurrentList?: string[];
  totalLiburPrevious?: number;
  alasanLiburPreviousList?: string[];

  cuacaCurrent?: {
    cerah: number;
    mendung: number;
    gerimis: number;
    hujan: number;
  };
  cuacaPrevious?: {
    cerah: number;
    mendung: number;
    gerimis: number;
    hujan: number;
  };

  cuacaCurrentBreakdown?: {
    label: string;
    dominant: string;
    cerah: number;
    mendung: number;
    gerimis: number;
    hujan: number;
    logs?: { timeRange: string; weather: string }[];
  }[];
  cuacaPreviousBreakdown?: {
    label: string;
    dominant: string;
    cerah: number;
    mendung: number;
    gerimis: number;
    hujan: number;
    logs?: { timeRange: string; weather: string }[];
  }[];

  hourlyLabels?: string[];
  dineInHourlyAvg?: number[];
  takeawayHourlyAvg?: number[];
  dineInPreviousHourlyAvg?: number[];
  takeawayPreviousHourlyAvg?: number[];
}
