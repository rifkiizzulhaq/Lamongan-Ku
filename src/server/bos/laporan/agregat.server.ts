"use server";

import { db } from "@/db";
import {
  orders,
  daily_reports,
  stock,
  daily_stock_snapshots,
  weather_logs,
  order_items,
} from "@/db/schema";
import type { WeatherLog } from "@/db/schema";
import { and, gte, lte, desc, inArray, sum, eq } from "drizzle-orm";
import type { AggregatedData } from "@/interfaces/laporan";
import { getLastFixDate, getShiftDate } from "./utils";
import { checkAndRunAutoClose } from "./auto-close.server";
import { requireAuth } from "@/lib/auth-guard";
import { computeHourlyAvg, aggregate } from "./agregat.helper";

export async function getAggregatedAnalytics(
  mode: "Mingguan" | "Bulanan" | "Tahunan",
): Promise<AggregatedData> {
  await requireAuth(["bos"]);
  checkAndRunAutoClose().catch(console.error);

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

  const firstOrder = await db.query.orders.findFirst({
    orderBy: (o, { asc }) => asc(o.createdAt),
  });
  const launchShiftDate = firstOrder
    ? getShiftDate(firstOrder.createdAt)
    : null;
  if (launchShiftDate) {
    launchShiftDate.setHours(0, 0, 0, 0);
  }

  if (launchShiftDate) {
    const rangeCurrentEnd = new Date(endOfFixDate);
    const lastShiftDate = getShiftDate(rangeCurrentEnd);
    lastShiftDate.setHours(0, 0, 0, 0);
    const diffTime = lastShiftDate.getTime() - launchShiftDate.getTime();
    const daysSinceLaunch = Math.floor(diffTime / (24 * 60 * 60 * 1000)) + 1;

    if (mode === "Mingguan") {
      if (daysSinceLaunch > 0 && daysSinceLaunch < 7) {
        days = daysSinceLaunch;
      }
    } else if (mode === "Bulanan") {
      if (daysSinceLaunch > 0 && daysSinceLaunch < 30) {
        days = daysSinceLaunch;
      }
    } else if (mode === "Tahunan") {
      if (daysSinceLaunch > 0 && daysSinceLaunch < 365) {
        days = daysSinceLaunch;
      }
    }
  }

  const rangeCurrentEnd = new Date(endOfFixDate);
  const rangeCurrentStart = new Date(
    endOfFixDate.getTime() - days * 24 * 60 * 60 * 1000,
  );
  const rangePreviousEnd = new Date(rangeCurrentStart);
  const rangePreviousStart = new Date(
    rangeCurrentStart.getTime() - days * 24 * 60 * 60 * 1000,
  );

  const [reportsCurr, reportsPrev, stockList] = await Promise.all([
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
    db.select().from(stock),
  ]);

  const [ordersCurr, ordersPrev] = await Promise.all([
    db.query.orders.findMany({
      where: and(
        gte(orders.createdAt, rangeCurrentStart),
        lte(orders.createdAt, rangeCurrentEnd),
      ),
    }),
    db.query.orders.findMany({
      where: and(
        gte(orders.createdAt, rangePreviousStart),
        lte(orders.createdAt, rangePreviousEnd),
      ),
    }),
  ]);

  const [soldItemsCurr, soldItemsPrev] = await Promise.all([
    db
      .select({
        stockId: order_items.stockId,
        total: sum(order_items.quantity),
      })
      .from(order_items)
      .leftJoin(orders, eq(order_items.orderId, orders.id))
      .where(
        and(
          gte(orders.createdAt, rangeCurrentStart),
          lte(orders.createdAt, rangeCurrentEnd),
        ),
      )
      .groupBy(order_items.stockId),
    db
      .select({
        stockId: order_items.stockId,
        total: sum(order_items.quantity),
      })
      .from(order_items)
      .leftJoin(orders, eq(order_items.orderId, orders.id))
      .where(
        and(
          gte(orders.createdAt, rangePreviousStart),
          lte(orders.createdAt, rangePreviousEnd),
        ),
      )
      .groupBy(order_items.stockId),
  ]);

  const currIds = reportsCurr.map((r) => r.id);
  const prevIds = reportsPrev.map((r) => r.id);

  const [snapsCurr, wLogsCurr] = await Promise.all([
    currIds.length > 0
      ? db
        .select()
        .from(daily_stock_snapshots)
        .where(inArray(daily_stock_snapshots.reportId, currIds))
      : Promise.resolve([]),
    currIds.length > 0
      ? db
        .select()
        .from(weather_logs)
        .where(inArray(weather_logs.reportId, currIds))
      : Promise.resolve([] as WeatherLog[]),
  ]);

  const [snapsPrev, wLogsPrev] = await Promise.all([
    prevIds.length > 0
      ? db
        .select()
        .from(daily_stock_snapshots)
        .where(inArray(daily_stock_snapshots.reportId, prevIds))
      : Promise.resolve([]),
    prevIds.length > 0
      ? db
        .select()
        .from(weather_logs)
        .where(inArray(weather_logs.reportId, prevIds))
      : Promise.resolve([] as WeatherLog[]),
  ]);

  const aggParams = {
    mode,
    days,
    labelFormat,
    rangeCurrentEnd,
    launchShiftDate,
  };
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

  const currSoldMap = Object.fromEntries(
    soldItemsCurr.map((i) => [i.stockId, Number(i.total || 0)]),
  );
  const prevSoldMap = Object.fromEntries(
    soldItemsPrev.map((i) => [i.stockId, Number(i.total || 0)]),
  );

  const sisaBahan = stockList
    .filter((s) => s.isUnlimited === 0)
    .map((s) => {
      const snapsCurrForItem = snapsCurr.filter((x) => x.stockId === s.id);
      const snapsPrevForItem = snapsPrev.filter((x) => x.stockId === s.id);

      snapsCurrForItem.sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
      );
      snapsPrevForItem.sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
      );

      const sisaCurrent =
        snapsCurrForItem[snapsCurrForItem.length - 1]?.sisaQuantity ?? 0;
      const sisaPrevious =
        snapsPrevForItem[snapsPrevForItem.length - 1]?.sisaQuantity ?? 0;

      const soldCurrent = currSoldMap[s.id] || 0;
      const soldPrevious = prevSoldMap[s.id] || 0;

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
    cuacaCurrentBreakdown: currAgg.cuacaBreakdown,
    cuacaPreviousBreakdown: prevAgg.cuacaBreakdown,
    hourlyLabels: currHourly.labels,
    dineInHourlyAvg: currHourly.dineIn,
    takeawayHourlyAvg: currHourly.takeaway,
    dineInPreviousHourlyAvg: prevHourly.dineIn,
    takeawayPreviousHourlyAvg: prevHourly.takeaway,
    sisaBahan,
  };
}
