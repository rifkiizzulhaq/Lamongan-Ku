"use server";

import { db } from "@/db";
import {
  orders,
  daily_reports,
  stock,
  daily_stock_snapshots,
  weather_logs,
} from "@/db/schema";
import type { Order, WeatherLog, DailyStockSnapshot } from "@/db/schema";
import { and, gte, lte, eq } from "drizzle-orm";
import type { DailyData } from "@/interfaces/models";
import {
  getWibDate,
  getLastFixDate,
  matchWeather,
  formatLabel,
  countPortion,
} from "./utils";
import { checkAndRunAutoClose } from "./auto-close.server";

export async function getDailyAnalytics(): Promise<DailyData> {
  await checkAndRunAutoClose();

  const { targetDate } = getLastFixDate();
  const reportDate = new Date(targetDate);
  const prevReportDate = new Date(
    targetDate.getTime() - 7 * 24 * 60 * 60 * 1000,
  );

  const getRange = (d: Date) => {
    const wib = getWibDate(d);
    const y = wib.getFullYear();
    const m = String(wib.getMonth() + 1).padStart(2, "0");
    const dStr = String(wib.getDate()).padStart(2, "0");
    const start = new Date(`${y}-${m}-${dStr}T15:00:00+07:00`);
    const end = new Date(start.getTime() + 11 * 60 * 60 * 1000);
    return { start, end };
  };

  const currentRange = getRange(reportDate);
  const previousRange = getRange(prevReportDate);
  const yesterdayRange = getRange(
    new Date(targetDate.getTime() - 1 * 24 * 60 * 60 * 1000),
  );
  const prevYesterdayRange = getRange(
    new Date(targetDate.getTime() - 8 * 24 * 60 * 60 * 1000),
  );

  const [
    ordersCurr,
    ordersPrev,
    reportCurr,
    reportPrev,
    stockList,
    reportYesterday,
    reportPrevPrev,
    currentShopStatus,
  ] = await Promise.all([
    db.query.orders.findMany({
      where: and(
        gte(orders.createdAt, currentRange.start),
        lte(orders.createdAt, currentRange.end),
      ),
      with: { items: true },
    }),
    db.query.orders.findMany({
      where: and(
        gte(orders.createdAt, previousRange.start),
        lte(orders.createdAt, previousRange.end),
      ),
      with: { items: true },
    }),
    db
      .select()
      .from(daily_reports)
      .where(
        and(
          gte(daily_reports.createdAt, currentRange.start),
          lte(daily_reports.createdAt, currentRange.end),
        ),
      )
      .limit(1),
    db
      .select()
      .from(daily_reports)
      .where(
        and(
          gte(daily_reports.createdAt, previousRange.start),
          lte(daily_reports.createdAt, previousRange.end),
        ),
      )
      .limit(1),
    db.select().from(stock),
    db
      .select()
      .from(daily_reports)
      .where(
        and(
          gte(daily_reports.createdAt, yesterdayRange.start),
          lte(daily_reports.createdAt, yesterdayRange.end),
        ),
      )
      .limit(1),
    db
      .select()
      .from(daily_reports)
      .where(
        and(
          gte(daily_reports.createdAt, prevYesterdayRange.start),
          lte(daily_reports.createdAt, prevYesterdayRange.end),
        ),
      )
      .limit(1),
    db.query.shop_status.findFirst(),
  ]);

  const [snapshotsCurr, snapshotsPrev, weatherCurr, weatherPrev] =
    await Promise.all([
      reportCurr[0]
        ? db
            .select()
            .from(daily_stock_snapshots)
            .where(eq(daily_stock_snapshots.reportId, reportCurr[0].id))
        : Promise.resolve([] as DailyStockSnapshot[]),
      reportPrev[0]
        ? db
            .select()
            .from(daily_stock_snapshots)
            .where(eq(daily_stock_snapshots.reportId, reportPrev[0].id))
        : Promise.resolve([] as DailyStockSnapshot[]),
      reportCurr[0]
        ? db
            .select()
            .from(weather_logs)
            .where(eq(weather_logs.reportId, reportCurr[0].id))
        : Promise.resolve([] as WeatherLog[]),
      reportPrev[0]
        ? db
            .select()
            .from(weather_logs)
            .where(eq(weather_logs.reportId, reportPrev[0].id))
        : Promise.resolve([] as WeatherLog[]),
      reportYesterday[0]
        ? db
            .select()
            .from(daily_stock_snapshots)
            .where(eq(daily_stock_snapshots.reportId, reportYesterday[0].id))
        : Promise.resolve([] as DailyStockSnapshot[]),
      reportPrevPrev[0]
        ? db
            .select()
            .from(daily_stock_snapshots)
            .where(eq(daily_stock_snapshots.reportId, reportPrevPrev[0].id))
        : Promise.resolve([] as DailyStockSnapshot[]),
    ]);

  const allOrders = [...ordersCurr, ...ordersPrev];
  const timeLabels = Array.from(
    new Set(
      allOrders.map((o) =>
        new Date(o.createdAt).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      ),
    ),
  ).sort((a, b) => {
    const val = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return (h < 6 ? h + 24 : h) * 60 + m;
    };
    return val(a) - val(b);
  });

  const revenueCurrent = new Array<number>(timeLabels.length).fill(0);
  const revenuePrevious = new Array<number>(timeLabels.length).fill(0);
  const dineInTrend = new Array<number>(timeLabels.length).fill(0);
  const takeawayTrend = new Array<number>(timeLabels.length).fill(0);
  const dineInPreviousTrend = new Array<number>(timeLabels.length).fill(0);
  const takeawayPreviousTrend = new Array<number>(timeLabels.length).fill(0);
  const cuacaCurrent = new Array<string>(timeLabels.length).fill("");
  const cuacaPrevious = new Array<string>(timeLabels.length).fill("");

  const fillData = (
    orderList: Order[],
    wLogs: WeatherLog[],
    revenue: number[],
    dineIn: number[],
    takeaway: number[],
    cuaca: string[],
  ) => {
    orderList.forEach((o) => {
      const label = new Date(o.createdAt).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const idx = timeLabels.indexOf(label);
      if (idx === -1) return;
      revenue[idx] += o.totalPrice;
      const t = o.orderType.toLowerCase();
      if (t.includes("makan") || t.includes("dine") || t.includes("tempat"))
        dineIn[idx]++;
      else takeaway[idx]++;
      cuaca[idx] = matchWeather(label, wLogs);
    });
  };

  fillData(
    ordersCurr,
    weatherCurr,
    revenueCurrent,
    dineInTrend,
    takeawayTrend,
    cuacaCurrent,
  );
  fillData(
    ordersPrev,
    weatherPrev,
    revenuePrevious,
    dineInPreviousTrend,
    takeawayPreviousTrend,
    cuacaPrevious,
  );

  const excludedItems = ["teh manis", "nasi", "sambal"];
  const sisaBahan = stockList
    .filter((s) => !excludedItems.includes(s.name.toLowerCase()))
    .map((s) => {
      const sisaCurrent =
        snapshotsCurr.find((x) => x.stockId === s.id)?.sisaQuantity ?? 0;
      const sisaPrevious =
        snapshotsPrev.find((x) => x.stockId === s.id)?.sisaQuantity ?? 0;

      const soldCurrent = ordersCurr.reduce((sum, order) => {
        const orderItem = order.items?.find((item) => item.stockId === s.id);
        return sum + (orderItem ? orderItem.quantity : 0);
      }, 0);

      const soldPrevious = ordersPrev.reduce((sum, order) => {
        const orderItem = order.items?.find((item) => item.stockId === s.id);
        return sum + (orderItem ? orderItem.quantity : 0);
      }, 0);

      const stockAwalCurrent = sisaCurrent + soldCurrent;
      const stockAwalPrevious = sisaPrevious + soldPrevious;

      return {
        nama: s.name,
        sisaCurrent,
        sisaPrevious,
        stockAwalCurrent,
        stockAwalPrevious,
      };
    });

  const targetIsToday =
    currentRange.start.getTime() <= new Date().getTime() &&
    currentRange.end.getTime() > new Date().getTime();

  const isLiburCurrent =
    ordersCurr.length === 0 &&
    (!!reportCurr[0]?.note ||
      (targetIsToday && currentShopStatus?.isBuka === 0) ||
      !targetIsToday);

  const isLiburPrevious = ordersPrev.length === 0 && !!reportPrev[0]?.note;

  const getStats = (logs: WeatherLog[]) => {
    const stats = { cerah: 0, mendung: 0, gerimis: 0, hujan: 0 };
    logs.forEach((w) => {
      const l = w.weather.toLowerCase();
      if (l.includes("cerah")) stats.cerah++;
      else if (l.includes("hujan")) stats.hujan++;
      else if (l.includes("gerimis")) stats.gerimis++;
      else stats.mendung++;
    });
    return stats;
  };

  return {
    timeLabel: formatLabel(reportDate, "Ini"),
    prevTimeLabel: formatLabel(prevReportDate, "Lalu"),
    isLiburCurrent,
    isLiburPrevious,
    alasanLiburCurrent: isLiburCurrent
      ? reportCurr[0]?.note ||
        (targetIsToday ? currentShopStatus?.reason : "") ||
        "Tidak ada aktivitas penjualan pada hari tersebut (Libur/Tutup)."
      : "",
    alasanLiburPrevious: isLiburPrevious
      ? reportPrev[0]?.note ||
        "Tidak ada aktivitas penjualan pada hari tersebut (Libur/Tutup)."
      : "",
    revenueLabels: timeLabels,
    revenueCurrent,
    revenuePrevious,
    totalRevenueCurrent: ordersCurr.reduce((acc, o) => acc + o.totalPrice, 0),
    totalRevenuePrevious: ordersPrev.reduce((acc, o) => acc + o.totalPrice, 0),
    portionCurrent: ordersCurr.length,
    portionPrevious: ordersPrev.length,
    dineInCurrent: countPortion(ordersCurr, "dine"),
    takeawayCurrent: countPortion(ordersCurr, "takeaway"),
    dineInPrevious: countPortion(ordersPrev, "dine"),
    takeawayPrevious: countPortion(ordersPrev, "takeaway"),
    dineInTrend,
    takeawayTrend,
    dineInPreviousTrend,
    takeawayPreviousTrend,
    cuacaCurrent,
    cuacaPrevious,
    cuacaCurrentStats: getStats(weatherCurr),
    cuacaPreviousStats: getStats(weatherPrev),
    weatherLogsCurrent: weatherCurr.map((w) => ({
      timeRange: w.timeRange,
      weather: w.weather,
    })),
    weatherLogsPrevious: weatherPrev.map((w) => ({
      timeRange: w.timeRange,
      weather: w.weather,
    })),
    sisaBahan,
  };
}
