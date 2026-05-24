import type { Order, DailyReport, WeatherLog } from "@/db/schema";
import { getWibDate, getShiftDate, dominantWeather } from "./utils";

export interface AggregateParams {
  reports: DailyReport[];
  orderList: Order[];
  weatherLogs: WeatherLog[];
  mode: "Mingguan" | "Bulanan" | "Tahunan";
  days: number;
  labelFormat: Intl.DateTimeFormatOptions;
  rangeCurrentEnd: Date;
  launchShiftDate?: Date | null;
}

export function computeHourlyAvg(
  orderList: Order[],
  numDays: number,
): { labels: string[]; dineIn: number[]; takeaway: number[] } {
  const hours = [
    "12:00",
    "13:00",
    "14:00",
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

export function aggregate({
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
    const start = new Date(`${y}-${m}-${d}T12:00:00+07:00`);
    const end = new Date(start.getTime() + 14 * 60 * 60 * 1000);
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
    const ordersByDate = new Map<string, typeof orderList[0][]>();
    for (const o of orderList) {
      const sd = getShiftDate(o.createdAt);
      const yy = sd.getFullYear();
      const mm = String(sd.getMonth() + 1).padStart(2, "0");
      const dd = String(sd.getDate()).padStart(2, "0");
      const key = `${yy}-${mm}-${dd}`;
      if (!ordersByDate.has(key)) ordersByDate.set(key, []);
      ordersByDate.get(key)!.push(o);
    }

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
      const start = new Date(`${y}-${m}-${dStr}T06:00:00+07:00`);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

      const allOrdersForShift = ordersByDate.get(`${y}-${m}-${dStr}`) || [];
      const ordersForDay = allOrdersForShift.filter(
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
