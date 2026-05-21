import type { WeatherLog } from "@/db/schema";

export function getWibDate(date: Date | string | number = new Date()): Date {
  return new Date(
    new Date(date).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
}

export function getLastFixDate(): { targetDate: Date; endOfFixDate: Date } {
  const wibNow = getWibDate();
  const currentHour = wibNow.getHours();
  const targetWib = new Date(wibNow);

  if (currentHour >= 6) {
    targetWib.setDate(targetWib.getDate() - 1);
  } else {
    targetWib.setDate(targetWib.getDate() - 2);
  }

  const y = targetWib.getFullYear();
  const m = String(targetWib.getMonth() + 1).padStart(2, "0");
  const d = String(targetWib.getDate()).padStart(2, "0");
  const targetDate = new Date(`${y}-${m}-${d}T00:00:00+07:00`);

  const endWib = new Date(targetWib);
  endWib.setDate(endWib.getDate() + 1);
  const yE = endWib.getFullYear();
  const mE = String(endWib.getMonth() + 1).padStart(2, "0");
  const dE = String(endWib.getDate()).padStart(2, "0");
  const endOfFixDate = new Date(`${yE}-${mE}-${dE}T02:00:00+07:00`);

  return { targetDate, endOfFixDate };
}

export function getAutoCloseTargetDate(): Date {
  const wibNow = getWibDate();
  const currentHour = wibNow.getHours();
  const targetWib = new Date(wibNow);

  if (currentHour >= 2) {
    targetWib.setDate(targetWib.getDate() - 1);
  } else {
    targetWib.setDate(targetWib.getDate() - 2);
  }

  const y = targetWib.getFullYear();
  const m = String(targetWib.getMonth() + 1).padStart(2, "0");
  const d = String(targetWib.getDate()).padStart(2, "0");
  return new Date(`${y}-${m}-${d}T00:00:00+07:00`);
}

export function getShiftDate(date: Date | string | number): Date {
  const wib = getWibDate(date);
  if (wib.getHours() < 6) wib.setDate(wib.getDate() - 1);
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
  const hari = d.toLocaleDateString("id-ID", {
    weekday: "long",
    timeZone: "Asia/Jakarta",
  });
  const tgl = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  });
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
