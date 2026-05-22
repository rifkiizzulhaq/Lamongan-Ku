import type { WeatherLog } from "@/db/schema";
import { toZonedTime, format } from "date-fns-tz";
import { subDays, set } from "date-fns";
import { id } from "date-fns/locale";

const TIMEZONE = "Asia/Jakarta";

export function getWibDate(date: Date | string | number = new Date()): Date {
  return toZonedTime(new Date(date), TIMEZONE);
}

export function getLastFixDate(): { targetDate: Date; endOfFixDate: Date } {
  const wibNow = getWibDate();
  const currentHour = wibNow.getHours();

  const targetWib = currentHour >= 6 ? subDays(wibNow, 1) : subDays(wibNow, 2);

  const targetDateStr = format(targetWib, "yyyy-MM-dd'T'00:00:00XXX", { timeZone: TIMEZONE });
  const targetDate = new Date(targetDateStr);

  const endWib = set(targetWib, { hours: 2, minutes: 0, seconds: 0, milliseconds: 0 });
  const endOfFixDateStr = format(endWib, "yyyy-MM-dd'T'02:00:00XXX", { timeZone: TIMEZONE });
  const endOfFixDate = new Date(new Date(endOfFixDateStr).getTime() + 24 * 60 * 60 * 1000);

  return { targetDate, endOfFixDate };
}

export function getAutoCloseTargetDate(): Date {
  const wibNow = getWibDate();
  const currentHour = wibNow.getHours();

  const targetWib = currentHour >= 2 ? subDays(wibNow, 1) : subDays(wibNow, 2);
  const targetDateStr = format(targetWib, "yyyy-MM-dd'T'00:00:00XXX", { timeZone: TIMEZONE });
  return new Date(targetDateStr);
}

export function getShiftDate(date: Date | string | number): Date {
  const wib = getWibDate(date);
  if (wib.getHours() < 6) return subDays(wib, 1);
  return wib;
}

export function matchWeather(time: string, logs: WeatherLog[]): string {
  if (logs.length === 0) return "Cerah";
  const found = logs.find((w) => {
    const parts = w.timeRange.split("-").map((p) => p.trim());
    if (parts.length !== 2) return false;
    const getVal = (t: string) => {
      const [h, min] = t.split(":").map(Number);
      return (h < 6 ? h + 24 : h) * 60 + (min || 0);
    };
    const tVal = getVal(time);
    return tVal >= getVal(parts[0]) && tVal <= getVal(parts[1]);
  });
  return found ? found.weather : "Cerah";
}

export function formatLabel(d: Date, suffix: string): string {
  const wibDate = getWibDate(d);
  const hari = format(wibDate, "EEEE", { locale: id });
  const tgl = format(wibDate, "d MMM", { locale: id });
  return `${hari} ${suffix} (${tgl})`;
}

export function countPortion(
  list: { orderType: string }[],
  target: "dine" | "takeaway",
): number {
  return list.filter((o) => {
    const t = o.orderType.toLowerCase();
    const isDine =
      t.includes("makan") || t.includes("dine") || t.includes("tempat");
    return target === "dine" ? isDine : !isDine;
  }).length;
}

export function dominantWeather(logs: WeatherLog[]): string {
  const c = { cerah: 0, mendung: 0, hujan: 0 };
  logs.forEach((w) => {
    const l = w.weather.toLowerCase();
    if (l.includes("cerah")) c.cerah++;
    else if (l.includes("hujan")) c.hujan++;
    else c.mendung++;
  });
  if (c.hujan >= c.cerah && c.hujan >= c.mendung) return "Hujan";
  if (c.mendung >= c.cerah && c.mendung > c.hujan) return "Mendung";
  return c.cerah > 0 ? "Cerah" : "";
}
