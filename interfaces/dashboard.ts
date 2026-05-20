export interface DashboardWeatherItem {
  id: number;
  timeRange: string;
  weather: string;
}

export interface DashboardSisaBahanItem {
  id: number;
  nama: string;
  sisa: number | null;
}

export interface DashboardShopStatusItem {
  isBuka: number;
  reason: string | null;
}

export interface DashboardStatsResponse {
  pendapatan: number;
  pendapatanFisik: number;
  pesananCount: number;
  sisaBahan: DashboardSisaBahanItem[];
  note: string | null;
  weathers: DashboardWeatherItem[];
  isClosed: boolean;
  shopStatus?: DashboardShopStatusItem;
}
