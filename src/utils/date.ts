export function getShiftWaktu() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 3600000 * 7);

  const hour = wib.getHours();
  const date = new Date(wib);

  if (hour < 6) {
    date.setDate(date.getDate() - 1);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  const startOfDay = new Date(`${y}-${m}-${d}T06:00:00+07:00`);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1000);

  return { startOfDay, endOfDay };
}
