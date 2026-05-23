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
