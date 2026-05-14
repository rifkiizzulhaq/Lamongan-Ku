"use server";

import { db } from "@/db";
import {
  orders,
  daily_reports,
  stock,
  daily_stock_snapshots,
  weather_logs,
} from "@/db/schema";
import type { Order, DailyReport, WeatherLog } from "@/db/schema";
import { and, gte, lte, desc, inArray } from "drizzle-orm";
import type { AggregatedData } from "@/interfaces/models";
import {
  getWibDate,
  getLastFixDate,
  getShiftDate,
  dominantWeather,
} from "./utils";
import { checkAndRunAutoClose } from "./auto-close.server";

interface AggregateParams {
  reports: DailyReport[];
  orderList: Order[];
  weatherLogs: WeatherLog[];
  mode: "Mingguan" | "Bulanan" | "Tahunan";
  days: number;
  labelFormat: Intl.DateTimeFormatOptions;
  rangeCurrentEnd: Date;
}

function computeHourlyAvg(
  orderList: Order[],
  numDays: number,
): { labels: string[]; dineIn: number[]; takeaway: number[] } {
  const hours = [
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
  ];
  const dIn = new Array<number>(hours.length).fill(0);
  const tAway = new Array<number>(hours.length).fill(0);

  orderList.forEach((o) => {
    const h = new Date(o.createdAt).getHours();
    const label = `${String(h).padStart(2, "0")}:00`;
    const idx = hours.indexOf(label);
    if (idx === -1) return;
    const t = o.orderType.toLowerCase();
    if (t.includes("makan") || t.includes("dine") || t.includes("tempat"))
      dIn[idx]++;
    else tAway[idx]++;
  });

  const safe = Math.max(numDays, 1);
  return {
    labels: hours,
    dineIn: dIn.map((v) => Math.round(v / safe)),
    takeaway: tAway.map((v) => Math.round(v / safe)),
  };
}

function aggregate({
  reports,
  orderList,
  weatherLogs,
  mode,
  days,
  labelFormat,
  rangeCurrentEnd,
}: AggregateParams) {
  const totalRevenue = reports.reduce(
    (acc, r) => acc + (r.actualRevenue || 0),
    0,
  );
  const totalPortion = orderList.length;

  const isLibur = (r: DailyReport) => {
    const sd = getShiftDate(r.createdAt);
    const y = sd.getFullYear();
    const m = String(sd.getMonth() + 1).padStart(2, "0");
    const d = String(sd.getDate()).padStart(2, "0");
    const start = new Date(`${y}-${m}-${d}T15:00:00+07:00`);
    const end = new Date(start.getTime() + 11 * 60 * 60 * 1000);
    const hasOrders = orderList.some(
      (o) => o.createdAt >= start && o.createdAt <= end,
    );
    return !hasOrders && !!r.note;
  };

  const liburReports = reports.filter(isLibur);
  const totalLibur = liburReports.length;
  const alasanLibur = liburReports.map((r) => r.note ?? "Libur");

  const cuaca = { cerah: 0, mendung: 0, hujan: 0 };
  weatherLogs.forEach((w) => {
    const l = w.weather.toLowerCase();
    if (l.includes("cerah")) cuaca.cerah++;
    else if (l.includes("hujan")) cuaca.hujan++;
    else cuaca.mendung++;
  });

  const dInTotal = orderList.filter((o) => {
    const t = o.orderType.toLowerCase();
    return t.includes("makan") || t.includes("dine") || t.includes("tempat");
  }).length;

  const labels: string[] = [];
  const revenueTrend: number[] = [];
  const portionTrend: number[] = [];
  const weatherTrend: string[] = [];
  const weatherLogsTrend: { timeRange: string; weather: string }[][] = [];
  const isLiburTrend: boolean[] = [];
  const alasanLiburTrend: string[] = [];

  const shiftTarget = new Date(rangeCurrentEnd.getTime() - 24 * 60 * 60 * 1000);

  if (mode === "Tahunan") {
    for (let i = 11; i >= 0; i--) {
      const wib = getWibDate(shiftTarget);
      wib.setMonth(wib.getMonth() - i);
      const y = wib.getFullYear();
      const m = String(wib.getMonth() + 1).padStart(2, "0");
      const safeDate = new Date(`${y}-${m}-15T00:00:00+07:00`);
      labels.push(safeDate.toLocaleDateString("id-ID", labelFormat));

      const monthReports = reports.filter((r) => {
        const sd = getShiftDate(r.createdAt);
        return (
          sd.getMonth() === wib.getMonth() &&
          sd.getFullYear() === wib.getFullYear()
        );
      });
      revenueTrend.push(
        monthReports.reduce((acc, r) => acc + (r.actualRevenue || 0), 0),
      );

      const monthOrders = orderList.filter((o) => {
        const sd = getShiftDate(o.createdAt);
        return (
          sd.getMonth() === wib.getMonth() &&
          sd.getFullYear() === wib.getFullYear()
        );
      });
      portionTrend.push(monthOrders.length);

      const monthLiburs = monthReports.filter(isLibur);
      isLiburTrend.push(monthLiburs.length > 0);
      alasanLiburTrend.push(
        monthLiburs.length > 0
          ? `Libur ${monthLiburs.length}x: ` +
              Array.from(new Set(monthLiburs.map((r) => r.note))).join(", ")
          : "",
      );

      const mWLogs = weatherLogs.filter((w) =>
        monthReports.some((r) => r.id === w.reportId),
      );
      weatherTrend.push(dominantWeather(mWLogs));
      weatherLogsTrend.push([]);
    }
  } else {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(shiftTarget.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(d.toLocaleDateString("id-ID", labelFormat));

      const dWib = getWibDate(d);
      const reportForDay = reports.find((r) => {
        const sd = getShiftDate(r.createdAt);
        return (
          sd.getDate() === dWib.getDate() &&
          sd.getMonth() === dWib.getMonth() &&
          sd.getFullYear() === dWib.getFullYear()
        );
      });

      revenueTrend.push(reportForDay?.actualRevenue ?? 0);

      const y = dWib.getFullYear();
      const m = String(dWib.getMonth() + 1).padStart(2, "0");
      const dStr = String(dWib.getDate()).padStart(2, "0");
      const start = new Date(`${y}-${m}-${dStr}T15:00:00+07:00`);
      const end = new Date(start.getTime() + 11 * 60 * 60 * 1000);

      const portions = orderList.filter(
        (o) => o.createdAt >= start && o.createdAt <= end,
      ).length;
      portionTrend.push(portions);

      const isDayLibur = !portions && reportForDay && !!reportForDay.note;
      isLiburTrend.push(!!isDayLibur);
      alasanLiburTrend.push(isDayLibur ? (reportForDay.note ?? "") : "");

      if (reportForDay) {
        const wLogs = weatherLogs.filter((w) => w.reportId === reportForDay.id);
        weatherTrend.push(wLogs.length > 0 ? dominantWeather(wLogs) : "Cerah");
        weatherLogsTrend.push(
          wLogs.map((w) => ({ timeRange: w.timeRange, weather: w.weather })),
        );
      } else {
        weatherTrend.push("");
        weatherLogsTrend.push([]);
      }
    }
  }

  return {
    labels,
    revenueTrend,
    portionTrend,
    weatherTrend,
    weatherLogsTrend,
    isLiburTrend,
    alasanLiburTrend,
    totalRevenue,
    totalPortion,
    totalLibur,
    alasanLibur,
    dineIn: dInTotal,
    takeaway: totalPortion - dInTotal,
    cuaca,
  };
}

export async function getAggregatedAnalytics(
  mode: "Mingguan" | "Bulanan" | "Tahunan",
): Promise<AggregatedData> {
  await checkAndRunAutoClose();

  const { endOfFixDate } = getLastFixDate();
  let days = 7;
  let labelFormat: Intl.DateTimeFormatOptions = {
    weekday: "short",
    timeZone: "Asia/Jakarta",
  };

  if (mode === "Bulanan") {
    days = 30;
    labelFormat = { day: "numeric", timeZone: "Asia/Jakarta" };
  } else if (mode === "Tahunan") {
    days = 365;
    labelFormat = { month: "short", timeZone: "Asia/Jakarta" };
  }

  const rangeCurrentEnd = new Date(endOfFixDate);
  const rangeCurrentStart = new Date(
    endOfFixDate.getTime() - days * 24 * 60 * 60 * 1000,
  );
  const rangePreviousEnd = new Date(rangeCurrentStart);
  const rangePreviousStart = new Date(
    rangeCurrentStart.getTime() - days * 24 * 60 * 60 * 1000,
  );

  const [reportsCurr, reportsPrev, ordersCurr, ordersPrev, stockList] =
    await Promise.all([
      db
        .select()
        .from(daily_reports)
        .where(
          and(
            gte(daily_reports.createdAt, rangeCurrentStart),
            lte(daily_reports.createdAt, rangeCurrentEnd),
          ),
        )
        .orderBy(desc(daily_reports.createdAt)),
      db
        .select()
        .from(daily_reports)
        .where(
          and(
            gte(daily_reports.createdAt, rangePreviousStart),
            lte(daily_reports.createdAt, rangePreviousEnd),
          ),
        )
        .orderBy(desc(daily_reports.createdAt)),
      db
        .select()
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, rangeCurrentStart),
            lte(orders.createdAt, rangeCurrentEnd),
          ),
        ),
      db
        .select()
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, rangePreviousStart),
            lte(orders.createdAt, rangePreviousEnd),
          ),
        ),
      db.select().from(stock),
    ]);

  const currIds = reportsCurr.map((r) => r.id);
  const prevIds = reportsPrev.map((r) => r.id);

  const [snapsCurr, snapsPrev, wLogsCurr, wLogsPrev] = await Promise.all([
    currIds.length > 0
      ? db
          .select()
          .from(daily_stock_snapshots)
          .where(inArray(daily_stock_snapshots.reportId, currIds))
      : Promise.resolve([]),
    prevIds.length > 0
      ? db
          .select()
          .from(daily_stock_snapshots)
          .where(inArray(daily_stock_snapshots.reportId, prevIds))
      : Promise.resolve([]),
    currIds.length > 0
      ? db
          .select()
          .from(weather_logs)
          .where(inArray(weather_logs.reportId, currIds))
      : Promise.resolve([] as WeatherLog[]),
    prevIds.length > 0
      ? db
          .select()
          .from(weather_logs)
          .where(inArray(weather_logs.reportId, prevIds))
      : Promise.resolve([] as WeatherLog[]),
  ]);

  const aggParams = { mode, days, labelFormat, rangeCurrentEnd };
  const currAgg = aggregate({
    reports: reportsCurr,
    orderList: ordersCurr,
    weatherLogs: wLogsCurr,
    ...aggParams,
  });
  const prevAgg = aggregate({
    reports: reportsPrev,
    orderList: ordersPrev,
    weatherLogs: wLogsPrev,
    ...aggParams,
  });

  const currHourly = computeHourlyAvg(ordersCurr, days);
  const prevHourly = computeHourlyAvg(ordersPrev, days);

  const excludedItems = ["teh manis", "nasi", "sambal"];
  const sisaBahan = stockList
    .filter((s) => !excludedItems.includes(s.name.toLowerCase()))
    .map((s) => ({
      nama: s.name,
      sisaCurrent: Math.round(
        snapsCurr
          .filter((x) => x.stockId === s.id)
          .reduce((acc, x) => acc + x.sisaQuantity, 0) /
          Math.max(reportsCurr.length, 1),
      ),
      sisaPrevious: Math.round(
        snapsPrev
          .filter((x) => x.stockId === s.id)
          .reduce((acc, x) => acc + x.sisaQuantity, 0) /
          Math.max(reportsPrev.length, 1),
      ),
    }));

  return {
    timeLabel:
      mode === "Mingguan"
        ? "Minggu Ini"
        : mode === "Bulanan"
          ? "Bulan Ini"
          : "Tahun Ini",
    prevTimeLabel:
      mode === "Mingguan"
        ? "Minggu Lalu"
        : mode === "Bulanan"
          ? "Bulan Lalu"
          : "Tahun Lalu",
    labels: currAgg.labels,
    revenueCurrentTrend: currAgg.revenueTrend,
    revenuePreviousTrend: prevAgg.revenueTrend,
    portionCurrentTrend: currAgg.portionTrend,
    portionPreviousTrend: prevAgg.portionTrend,
    weatherCurrentTrend: currAgg.weatherTrend,
    weatherPreviousTrend: prevAgg.weatherTrend,
    weatherLogsCurrentTrend: currAgg.weatherLogsTrend,
    weatherLogsPreviousTrend: prevAgg.weatherLogsTrend,
    isLiburCurrentTrend: currAgg.isLiburTrend,
    isLiburPreviousTrend: prevAgg.isLiburTrend,
    alasanLiburCurrentTrend: currAgg.alasanLiburTrend,
    alasanLiburPreviousTrend: prevAgg.alasanLiburTrend,
    totalRevenueCurrent: currAgg.totalRevenue,
    totalRevenuePrevious: prevAgg.totalRevenue,
    totalPortionCurrent: currAgg.totalPortion,
    totalPortionPrevious: prevAgg.totalPortion,
    dineInCurrent: currAgg.dineIn,
    takeawayCurrent: currAgg.takeaway,
    dineInPrevious: prevAgg.dineIn,
    takeawayPrevious: prevAgg.takeaway,
    totalLiburCurrent: currAgg.totalLibur,
    alasanLiburCurrentList: currAgg.alasanLibur,
    totalLiburPrevious: prevAgg.totalLibur,
    alasanLiburPreviousList: prevAgg.alasanLibur,
    cuacaCurrent: currAgg.cuaca,
    cuacaPrevious: prevAgg.cuaca,
    hourlyLabels: currHourly.labels,
    dineInHourlyAvg: currHourly.dineIn,
    takeawayHourlyAvg: currHourly.takeaway,
    dineInPreviousHourlyAvg: prevHourly.dineIn,
    takeawayPreviousHourlyAvg: prevHourly.takeaway,
    sisaBahan,
  };
}
