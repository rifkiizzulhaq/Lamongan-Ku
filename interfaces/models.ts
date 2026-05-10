type CuacaOption = "Cerah" | "Mendung" | "Gerimis" | "Hujan";

export interface CartItem {
  stockId: number;
  name: string;
  price: number;
  quantity: number;
  isTakeaway?: boolean;
}

export interface OrderItem {
  n: string;
  q: number;
}

export interface KursiItem {
  n: string;
  q: number;
  isTakeaway?: boolean;
}

export interface CuacaSlot {
  jam: string;
  cuaca: CuacaOption | null;
}

export interface SisaItem {
  nama: string;
  sisa?: number;
}

export interface StockFormItem {
  id: number;
  nama: string;
  price: number;
  quantity: number | null;
  sisaKemarin: number;
}

export interface SisaBahanData {
  nama: string;
  sisaCurrent: number;
  sisaPrevious: number;
}

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

  cuacaCurrent?: { cerah: number; mendung: number; hujan: number } | string[];
  cuacaPrevious?: { cerah: number; mendung: number; hujan: number } | string[];

  sisaBahan: SisaBahanData[];
}

export interface AggregatedData {
  timeLabel: string;
  prevTimeLabel: string;

  labels: string[];
  revenueCurrentTrend: number[];
  revenuePreviousTrend: number[];
  portionCurrentTrend: number[];
  portionPreviousTrend: number[];

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

  cuacaCurrent?: { cerah: number; mendung: number; hujan: number };
  cuacaPrevious?: { cerah: number; mendung: number; hujan: number };

  hourlyLabels?: string[];
  dineInHourlyAvg?: number[];
  takeawayHourlyAvg?: number[];
  dineInPreviousHourlyAvg?: number[];
  takeawayPreviousHourlyAvg?: number[];

  sisaBahan: SisaBahanData[];
}

export interface WeatherStats {
  cerah: number;
  mendung: number;
  hujan: number;
}
