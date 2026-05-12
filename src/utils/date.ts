export function getShiftWaktu() {
  const now = new Date();
  const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

  const currentHour = wibTime.getUTCHours();
  const shiftDate = new Date(wibTime);

  if (currentHour < 6) {
    shiftDate.setUTCDate(shiftDate.getUTCDate() - 1);
  }

  const y = shiftDate.getUTCFullYear();
  const m = String(shiftDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shiftDate.getUTCDate()).padStart(2, "0");

  const startOfDay = new Date(`${y}-${m}-${d}T06:00:00+07:00`);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1000);

  return { startOfDay, endOfDay };
}
