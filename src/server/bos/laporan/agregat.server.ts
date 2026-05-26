"use server";

import { db } from "@/db";
import { orders, daily_reports, weather_logs } from "@/db/schema";
import type { WeatherLog } from "@/db/schema";
import { and, gte, lte, desc, inArray } from "drizzle-orm";
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

  const [reportsCurr, reportsPrev] = await Promise.all([
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

  const currIds = reportsCurr.map((r) => r.id);
  const prevIds = reportsPrev.map((r) => r.id);

  const [wLogsCurr] = await Promise.all([
    currIds.length > 0
      ? db
          .select()
          .from(weather_logs)
          .where(inArray(weather_logs.reportId, currIds))
      : Promise.resolve([] as WeatherLog[]),
  ]);

  const [wLogsPrev] = await Promise.all([
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
  };
}
