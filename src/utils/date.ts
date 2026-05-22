import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { set, subDays, addDays } from "date-fns";

const TIMEZONE = "Asia/Jakarta";

export function getShiftWaktu() {
  const now = new Date();
  const wibNow = toZonedTime(now, TIMEZONE);

  let shiftDate = wibNow;
  if (wibNow.getHours() < 6) {
    shiftDate = subDays(wibNow, 1);
  }

  const startWib = set(shiftDate, {
    hours: 6,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  const endWib = set(addDays(shiftDate, 1), {
    hours: 5,
    minutes: 59,
    seconds: 59,
    milliseconds: 999,
  });

  const startOfDay = fromZonedTime(startWib, TIMEZONE);
  const endOfDay = fromZonedTime(endWib, TIMEZONE);

  return { startOfDay, endOfDay };
}
