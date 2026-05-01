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

export const mockDailyData: DailyData = {
  timeLabel: "Senin Ini (10 Mei)",
  prevTimeLabel: "Senin Lalu (3 Mei)",

  isLiburCurrent: false,
  isLiburPrevious: false,

  revenueLabels: [
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
    "00:00",
    "01:00",
    "02:00",
  ],
  revenueCurrent: [
    150000, 320000, 800000, 1500000, 2100000, 1100000, 850000, 600000, 450000,
    300000, 150000, 100000,
  ],
  revenuePrevious: [
    120000, 250000, 650000, 1200000, 1800000, 1500000, 950000, 500000, 350000,
    250000, 100000, 80000,
  ],

  totalRevenueCurrent: 8420000,
  totalRevenuePrevious: 7750000,

  portionCurrent: 285,
  portionPrevious: 260,

  dineInCurrent: 185,
  takeawayCurrent: 100,
  dineInPrevious: 160,
  takeawayPrevious: 100,

  dineInTrend: [5, 10, 25, 40, 50, 20, 15, 8, 5, 4, 2, 1],
  takeawayTrend: [2, 5, 10, 15, 25, 15, 10, 8, 5, 3, 1, 1],
  dineInPreviousTrend: [4, 8, 20, 30, 40, 25, 18, 5, 4, 3, 2, 1],
  takeawayPreviousTrend: [1, 4, 8, 12, 20, 25, 15, 5, 4, 3, 2, 1],

  cuacaCurrent: [
    "Cerah",
    "Cerah",
    "Mendung",
    "Hujan",
    "Hujan",
    "Mendung",
    "Cerah",
    "Cerah",
    "Cerah",
    "Cerah",
    "Cerah",
    "Cerah",
  ],
  cuacaPrevious: [
    "Cerah",
    "Cerah",
    "Cerah",
    "Cerah",
    "Cerah",
    "Mendung",
    "Mendung",
    "Hujan",
    "Hujan",
    "Cerah",
    "Cerah",
    "Cerah",
  ],

  sisaBahan: [
    { nama: "Ayam Goreng", sisaCurrent: 12, sisaPrevious: 0 },
    { nama: "Ayam Bakar", sisaCurrent: 5, sisaPrevious: 0 },
    { nama: "Lele Goreng", sisaCurrent: 8, sisaPrevious: 0 },
    { nama: "Bebek Goreng", sisaCurrent: 2, sisaPrevious: 0 },
    { nama: "Bebek Jumbo", sisaCurrent: 0, sisaPrevious: 0 },
    { nama: "Ati Ampela", sisaCurrent: 15, sisaPrevious: 0 },
    { nama: "Tempe/Tahu", sisaCurrent: 25, sisaPrevious: 0 },
    { nama: "Nasi Putih", sisaCurrent: 10, sisaPrevious: 0 },
    { nama: "Kepalan Ayam", sisaCurrent: 4, sisaPrevious: 0 },
    { nama: "Kepala Bebek", sisaCurrent: 6, sisaPrevious: 0 },
    { nama: "Usus", sisaCurrent: 0, sisaPrevious: 0 },
    { nama: "Kangkung", sisaCurrent: 3, sisaPrevious: 0 },
    { nama: "Kol Goreng", sisaCurrent: 1, sisaPrevious: 0 },
    { nama: "Sambal Extra", sisaCurrent: 5, sisaPrevious: 0 },
  ],
};

export const mockWeeklyData: AggregatedData = {
  timeLabel: "Minggu Ini",
  prevTimeLabel: "Minggu Lalu",

  labels: ["Sel", "Rab", "Kam", "Jum", "Sab", "Min", "Sen"],
  revenueCurrentTrend: [
    4500000, 4200000, 5100000, 6800000, 8500000, 9200000, 6420000,
  ],
  revenuePreviousTrend: [
    4300000, 4600000, 5000000, 6500000, 8100000, 8900000, 0,
  ], // Senin lalu libur

  portionCurrentTrend: [150, 140, 170, 220, 280, 310, 215],
  portionPreviousTrend: [145, 155, 165, 210, 270, 290, 0],

  totalRevenueCurrent: 44720000,
  totalRevenuePrevious: 37400000,

  totalPortionCurrent: 1505,
  totalPortionPrevious: 1235,

  dineInCurrent: 950,
  takeawayCurrent: 555,
  dineInPrevious: 780,
  takeawayPrevious: 455,

  totalLiburCurrent: 0,
  alasanLiburCurrentList: [],
  totalLiburPrevious: 1,
  alasanLiburPreviousList: ["Karyawan sakit & istirahat"],

  cuacaCurrent: { cerah: 4, mendung: 2, hujan: 1 },
  cuacaPrevious: { cerah: 5, mendung: 1, hujan: 1 },

  hourlyLabels: [
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
    "00:00",
    "01:00",
    "02:00",
  ],
  dineInHourlyAvg: [6, 12, 28, 45, 55, 22, 18, 10, 6, 5, 2, 1],
  takeawayHourlyAvg: [3, 6, 12, 18, 28, 18, 12, 9, 6, 4, 2, 1],
  dineInPreviousHourlyAvg: [5, 10, 22, 35, 45, 20, 15, 8, 5, 4, 2, 1],
  takeawayPreviousHourlyAvg: [2, 5, 10, 15, 22, 15, 10, 8, 5, 3, 1, 1],

  sisaBahan: [
    { nama: "Ayam Goreng", sisaCurrent: 45, sisaPrevious: 60 },
    { nama: "Ayam Bakar", sisaCurrent: 20, sisaPrevious: 25 },
    { nama: "Lele Goreng", sisaCurrent: 35, sisaPrevious: 40 },
    { nama: "Bebek Goreng", sisaCurrent: 15, sisaPrevious: 10 },
    { nama: "Bebek Jumbo", sisaCurrent: 5, sisaPrevious: 8 },
    { nama: "Ati Ampela", sisaCurrent: 60, sisaPrevious: 55 },
    { nama: "Tempe/Tahu", sisaCurrent: 120, sisaPrevious: 140 },
    { nama: "Nasi Putih", sisaCurrent: 50, sisaPrevious: 70 },
  ],
};

export const mockMonthlyData: AggregatedData = {
  timeLabel: "Bulan Ini (Mei)",
  prevTimeLabel: "Bulan Lalu (Apr)",

  labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
  revenueCurrentTrend: [42000000, 44720000, 0, 0],
  revenuePreviousTrend: [38000000, 39500000, 41000000, 45000000],

  portionCurrentTrend: [1400, 1505, 0, 0],
  portionPreviousTrend: [1250, 1310, 1360, 1500],

  totalRevenueCurrent: 86720000,
  totalRevenuePrevious: 163500000,

  totalPortionCurrent: 2905,
  totalPortionPrevious: 5420,

  dineInCurrent: 1800,
  takeawayCurrent: 1105,
  dineInPrevious: 3400,
  takeawayPrevious: 2020,

  totalLiburCurrent: 0,
  alasanLiburCurrentList: [],
  totalLiburPrevious: 2,
  alasanLiburPreviousList: ["Lebaran", "Karyawan sakit"],

  cuacaCurrent: { cerah: 18, mendung: 8, hujan: 4 },
  cuacaPrevious: { cerah: 15, mendung: 10, hujan: 5 },

  hourlyLabels: [
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
    "00:00",
    "01:00",
    "02:00",
  ],
  dineInHourlyAvg: [6, 12, 28, 45, 55, 22, 18, 10, 6, 5, 2, 1],
  takeawayHourlyAvg: [3, 6, 12, 18, 28, 18, 12, 9, 6, 4, 2, 1],
  dineInPreviousHourlyAvg: [5, 10, 22, 35, 45, 20, 15, 8, 5, 4, 2, 1],
  takeawayPreviousHourlyAvg: [2, 5, 10, 15, 22, 15, 10, 8, 5, 3, 1, 1],

  sisaBahan: [
    { nama: "Ayam Goreng", sisaCurrent: 85, sisaPrevious: 190 },
    { nama: "Ayam Bakar", sisaCurrent: 40, sisaPrevious: 85 },
    { nama: "Lele Goreng", sisaCurrent: 70, sisaPrevious: 140 },
    { nama: "Bebek Goreng", sisaCurrent: 25, sisaPrevious: 60 },
    { nama: "Bebek Jumbo", sisaCurrent: 10, sisaPrevious: 25 },
  ],
};

export const mockYearlyData: AggregatedData = {
  timeLabel: "Tahun Ini (2026)",
  prevTimeLabel: "Tahun Lalu (2025)",

  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Ags",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ],
  revenueCurrentTrend: [
    155000000, 142000000, 168000000, 163500000, 86720000, 0, 0, 0, 0, 0, 0, 0,
  ],
  revenuePreviousTrend: [
    140000000, 135000000, 150000000, 145000000, 152000000, 148000000, 155000000,
    160000000, 158000000, 165000000, 162000000, 180000000,
  ],

  portionCurrentTrend: [5100, 4700, 5600, 5420, 2905, 0, 0, 0, 0, 0, 0, 0],
  portionPreviousTrend: [
    4600, 4500, 5000, 4800, 5050, 4900, 5100, 5300, 5200, 5500, 5400, 6000,
  ],

  totalRevenueCurrent: 715220000,
  totalRevenuePrevious: 1850000000,

  totalPortionCurrent: 23725,
  totalPortionPrevious: 61350,

  dineInCurrent: 14500,
  takeawayCurrent: 9225,
  dineInPrevious: 38000,
  takeawayPrevious: 23350,

  totalLiburCurrent: 5,
  alasanLiburCurrentList: ["Mudik", "Sakit", "Renovasi warung", "Hujan badai"],
  totalLiburPrevious: 12,
  alasanLiburPreviousList: [
    "Mudik panjang",
    "Banyak yang sakit",
    "Libur keluarga",
  ],

  cuacaCurrent: { cerah: 210, mendung: 95, hujan: 60 },
  cuacaPrevious: { cerah: 190, mendung: 120, hujan: 55 },

  hourlyLabels: [
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
    "00:00",
    "01:00",
    "02:00",
  ],
  dineInHourlyAvg: [6, 12, 28, 45, 55, 22, 18, 10, 6, 5, 2, 1],
  takeawayHourlyAvg: [3, 6, 12, 18, 28, 18, 12, 9, 6, 4, 2, 1],
  dineInPreviousHourlyAvg: [5, 10, 22, 35, 45, 20, 15, 8, 5, 4, 2, 1],
  takeawayPreviousHourlyAvg: [2, 5, 10, 15, 22, 15, 10, 8, 5, 3, 1, 1],

  sisaBahan: [
    { nama: "Ayam Goreng", sisaCurrent: 450, sisaPrevious: 1200 },
    { nama: "Ayam Bakar", sisaCurrent: 210, sisaPrevious: 550 },
    { nama: "Lele Goreng", sisaCurrent: 380, sisaPrevious: 980 },
    { nama: "Bebek Goreng", sisaCurrent: 150, sisaPrevious: 420 },
    { nama: "Bebek Jumbo", sisaCurrent: 60, sisaPrevious: 150 },
  ],
};
