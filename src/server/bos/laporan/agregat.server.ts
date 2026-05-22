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
import type { Order, DailyReport, WeatherLog } from "@/db/schema";
import { and, gte, lte, desc, inArray, sum, eq } from "drizzle-orm";
import type { AggregatedData } from "@/interfaces/laporan";
import {
  getWibDate,
  getLastFixDate,
  getShiftDate,
  dominantWeather,
} from "./utils";
import { checkAndRunAutoClose } from "./auto-close.server";
import { requireAuth } from "@/lib/auth-guard";

interface AggregateParams {
  reports: DailyReport[];
  orderList: Order[];
  weatherLogs: WeatherLog[];
  mode: "Mingguan" | "Bulanan" | "Tahunan";
  days: number;
  labelFormat: Intl.DateTimeFormatOptions;
  rangeCurrentEnd: Date;
  launchShiftDate?: Date | null;
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

  const activeDays = new Set<string>();

  orderList.forEach((o) => {
    const wib = new Date(
      new Date(o.createdAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
      }),
    );
    const h = wib.getHours();
    const label = `${String(h).padStart(2, "0")}:00`;
    const idx = hours.indexOf(label);
    if (idx === -1) return;

    const shiftWib = new Date(wib);
    if (h < 6) shiftWib.setDate(shiftWib.getDate() - 1);
    activeDays.add(
      `${shiftWib.getFullYear()}-${shiftWib.getMonth()}-${shiftWib.getDate()}`,
    );

    const t = o.orderType.toLowerCase();
    if (t.includes("makan") || t.includes("dine") || t.includes("tempat"))
      dIn[idx]++;
    else tAway[idx]++;
  });

  const safe = Math.max(activeDays.size > 0 ? activeDays.size : numDays, 1);
  return {
    labels: hours,
    dineIn: dIn.map((v) => Math.round((v / safe) * 10) / 10),
    takeaway: tAway.map((v) => Math.round((v / safe) * 10) / 10),
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
  launchShiftDate,
}: AggregateParams) {
  const totalRevenue = orderList.reduce((acc, o) => acc + o.totalPrice, 0);
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
  const alasanLibur = liburReports.map((r) => {
    const d = getShiftDate(r.createdAt);
    const wib = getWibDate(d);
    const formatter = new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const dateStr = formatter.format(wib);
    return `${dateStr}: ${r.note ?? "Libur"}`;
  });

  const cuaca = { cerah: 0, mendung: 0, gerimis: 0, hujan: 0 };
  weatherLogs.forEach((w) => {
    const l = w.weather.toLowerCase();
    if (l.includes("cerah")) cuaca.cerah++;
    else if (l.includes("hujan")) cuaca.hujan++;
    else if (l.includes("gerimis")) cuaca.gerimis++;
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
  const cuacaBreakdown: {
    label: string;
    dominant: string;
    cerah: number;
    mendung: number;
    gerimis: number;
    hujan: number;
    logs?: { timeRange: string; weather: string }[];
  }[] = [];

  const shiftTarget = new Date(rangeCurrentEnd.getTime() - 24 * 60 * 60 * 1000);

  let monthsLimit = 12;
  if (mode === "Tahunan" && launchShiftDate) {
    const launchWib = getWibDate(launchShiftDate);
    const targetWib = getWibDate(shiftTarget);
    const launchMonth = launchWib.getFullYear() * 12 + launchWib.getMonth();
    const targetMonth = targetWib.getFullYear() * 12 + targetWib.getMonth();
    const monthsSinceLaunch = targetMonth - launchMonth + 1;
    if (monthsSinceLaunch > 0 && monthsSinceLaunch < 12) {
      monthsLimit = monthsSinceLaunch;
    }
  }

  if (mode === "Tahunan") {
    for (let i = monthsLimit - 1; i >= 0; i--) {
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
      const monthOrders = orderList.filter((o) => {
        const sd = getShiftDate(o.createdAt);
        return (
          sd.getMonth() === wib.getMonth() &&
          sd.getFullYear() === wib.getFullYear()
        );
      });

      revenueTrend.push(monthOrders.reduce((acc, o) => acc + o.totalPrice, 0));
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
      const dom = dominantWeather(mWLogs);
      weatherTrend.push(dom);
      weatherLogsTrend.push([]);

      const mCuaca = { cerah: 0, mendung: 0, gerimis: 0, hujan: 0 };
      mWLogs.forEach((w) => {
        const l = w.weather.toLowerCase();
        if (l.includes("cerah")) mCuaca.cerah++;
        else if (l.includes("hujan")) mCuaca.hujan++;
        else if (l.includes("gerimis")) mCuaca.gerimis++;
        else mCuaca.mendung++;
      });
      cuacaBreakdown.push({
        label: labels[labels.length - 1],
        dominant: dom,
        ...mCuaca,
        logs: mWLogs.map((w) => ({
          timeRange: w.timeRange,
          weather: w.weather,
        })),
      });
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

      const y = dWib.getFullYear();
      const m = String(dWib.getMonth() + 1).padStart(2, "0");
      const dStr = String(dWib.getDate()).padStart(2, "0");
      const start = new Date(`${y}-${m}-${dStr}T15:00:00+07:00`);
      const end = new Date(start.getTime() + 11 * 60 * 60 * 1000);

      const ordersForDay = orderList.filter(
        (o) => o.createdAt >= start && o.createdAt <= end,
      );
      revenueTrend.push(ordersForDay.reduce((acc, o) => acc + o.totalPrice, 0));

      const portions = ordersForDay.length;
      portionTrend.push(portions);

      const isDayLibur = !portions && reportForDay && !!reportForDay.note;
      isLiburTrend.push(!!isDayLibur);
      alasanLiburTrend.push(isDayLibur ? (reportForDay.note ?? "") : "");

      if (reportForDay) {
        const wLogs = weatherLogs.filter((w) => w.reportId === reportForDay.id);
        const dom = wLogs.length > 0 ? dominantWeather(wLogs) : "";
        weatherTrend.push(dom);
        weatherLogsTrend.push(
          wLogs.map((w) => ({ timeRange: w.timeRange, weather: w.weather })),
        );
        const dCuaca = { cerah: 0, mendung: 0, gerimis: 0, hujan: 0 };
        wLogs.forEach((w) => {
          const l = w.weather.toLowerCase();
          if (l.includes("cerah")) dCuaca.cerah++;
          else if (l.includes("hujan")) dCuaca.hujan++;
          else if (l.includes("gerimis")) dCuaca.gerimis++;
          else dCuaca.mendung++;
        });
        cuacaBreakdown.push({
          label: labels[labels.length - 1],
          dominant: dom,
          ...dCuaca,
          logs: wLogs.map((w) => ({
            timeRange: w.timeRange,
            weather: w.weather,
          })),
        });
      } else {
        weatherTrend.push("");
        weatherLogsTrend.push([]);
        cuacaBreakdown.push({
          label: labels[labels.length - 1],
          dominant: "",
          cerah: 0,
          mendung: 0,
          gerimis: 0,
          hujan: 0,
          logs: [],
        });
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
    cuacaBreakdown,
  };
}

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
