"use server";

import { db } from "@/db";
import {
  orders,
  daily_reports,
  stock,
  daily_stock_snapshots,
  shop_status,
} from "@/db/schema";
import { and, gte, lte } from "drizzle-orm";
import { getLastFixDate } from "./utils";

export async function checkAndRunAutoClose(): Promise<void> {
  const anyStockUpdate = await db.query.stock.findFirst({
    where: (s, { ne }) => ne(s.updatedAt, s.createdAt),
  });
  if (!anyStockUpdate) return;

  const { targetDate: latestFixDate } = getLastFixDate();

  for (let i = 13; i >= 0; i--) {
    const checkDate = new Date(latestFixDate);
    checkDate.setDate(checkDate.getDate() - i);

    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, "0");
    const dStr = String(checkDate.getDate()).padStart(2, "0");

    const shiftStart = new Date(`${y}-${m}-${dStr}T15:00:00+07:00`);
    const shiftEnd = new Date(shiftStart.getTime() + 11 * 60 * 60 * 1000);
    const stockCheckStart = new Date(`${y}-${m}-${dStr}T00:00:00+07:00`);
    const stockCheckEnd = new Date(`${y}-${m}-${dStr}T17:00:00+07:00`);

    const existingReport = await db.query.daily_reports.findFirst({
      where: and(
        gte(daily_reports.createdAt, shiftStart),
        lte(daily_reports.createdAt, shiftEnd),
      ),
    });
    if (existingReport) continue;

    const stockSavedToday = await db.query.stock.findFirst({
      where: (s, { and: _a, gte: _gte, lte: _lte }) =>
        _a(
          _gte(s.updatedAt, stockCheckStart),
          _lte(s.updatedAt, stockCheckEnd),
        ),
    });

    const shiftOrders = await db.query.orders.findMany({
      where: and(
        gte(orders.createdAt, shiftStart),
        lte(orders.createdAt, shiftEnd),
      ),
    });

    const wasActive = stockSavedToday !== undefined || shiftOrders.length > 0;

    if (wasActive && shiftOrders.length > 0) {
      const totalRevenue = shiftOrders.reduce(
        (acc, o) => acc + o.totalPrice,
        0,
      );
      const [newReport] = await db
        .insert(daily_reports)
        .values({
          actualRevenue: totalRevenue,
          systemRevenue: totalRevenue,
          note: "Sistem Otomatis: Karyawan lupa tutup warung",
          createdAt: shiftEnd,
        })
        .returning({ id: daily_reports.id });

      const currentStocks = await db.select().from(stock);
      if (currentStocks.length > 0) {
        await db.insert(daily_stock_snapshots).values(
          currentStocks.map((s) => ({
            reportId: newReport.id,
            stockId: s.id,
            sisaQuantity: s.quantity || 0,
            createdAt: shiftEnd,
          })),
        );
      }
    } else if (!wasActive) {
      await db.insert(daily_reports).values({
        actualRevenue: 0,
        systemRevenue: 0,
        note: "Sistem Otomatis: Tidak ada penjualan (Libur/Tutup)",
        createdAt: shiftEnd,
      });

      if (i === 0) {
        await db.update(shop_status).set({
          isBuka: 0,
          reason: "Sistem Otomatis: Kemarin Libur",
          updatedAt: new Date(),
        });
      }
    }
  }
}
