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

  const [ordersCurr, ordersPrev, reportCurr, reportPrev, stockList] =
    await Promise.all([
      db
        .select()
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, currentRange.start),
            lte(orders.createdAt, currentRange.end),
          ),
        ),
      db
        .select()
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, previousRange.start),
            lte(orders.createdAt, previousRange.end),
          ),
        ),
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
    ]);

  // Buat label waktu terurut shift-aware (23:xx sebelum 00:xx)
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
    .map((s) => ({
      nama: s.name,
      sisaCurrent:
        snapshotsCurr.find((x) => x.stockId === s.id)?.sisaQuantity ?? 0,
      sisaPrevious:
        snapshotsPrev.find((x) => x.stockId === s.id)?.sisaQuantity ?? 0,
    }));

  const isLiburCurrent =
    reportCurr[0]?.actualRevenue === 0 && !!reportCurr[0]?.note;
  const isLiburPrevious =
    reportPrev[0]?.actualRevenue === 0 && !!reportPrev[0]?.note;

  return {
    timeLabel: formatLabel(reportDate, "Ini"),
    prevTimeLabel: formatLabel(prevReportDate, "Lalu"),
    isLiburCurrent,
    isLiburPrevious,
    alasanLiburCurrent: isLiburCurrent ? (reportCurr[0]?.note ?? "") : "",
    alasanLiburPrevious: isLiburPrevious ? (reportPrev[0]?.note ?? "") : "",
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
    sisaBahan,
  };
}
