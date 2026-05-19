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
import { getLastFixDate, getWibDate } from "./utils";

export async function checkAndRunAutoClose(): Promise<void> {
  const wibNow = getWibDate();
  const nowHour = wibNow.getHours();

  if (nowHour >= 17) {
    const ty = wibNow.getFullYear();
    const tm = String(wibNow.getMonth() + 1).padStart(2, "0");
    const td = String(wibNow.getDate()).padStart(2, "0");

    const todayShiftStart = new Date(`${ty}-${tm}-${td}T15:00:00+07:00`);
    const todayShiftEnd = new Date(
      todayShiftStart.getTime() + 11 * 60 * 60 * 1000,
    );
    const todayStockCheckStart = new Date(`${ty}-${tm}-${td}T00:00:00+07:00`);
    const todayStockCheckEnd = new Date(`${ty}-${tm}-${td}T17:00:00+07:00`);

    const existingTodayReport = await db.query.daily_reports.findFirst({
      where: and(
        gte(daily_reports.createdAt, todayShiftStart),
        lte(daily_reports.createdAt, todayShiftEnd),
      ),
    });

    if (!existingTodayReport) {
      const todayStockSaved = await db.query.stock.findFirst({
        where: (s, { and: _a, gte: _gte, lte: _lte }) =>
          _a(
            _gte(s.updatedAt, todayStockCheckStart),
            _lte(s.updatedAt, todayStockCheckEnd),
          ),
      });

      const todayOrders = await db.query.orders.findMany({
        where: and(
          gte(orders.createdAt, todayShiftStart),
          lte(orders.createdAt, new Date()),
        ),
      });

      const todayActive =
        todayStockSaved !== undefined || todayOrders.length > 0;

      if (!todayActive) {
        const currentStatus = await db.query.shop_status.findFirst();
        if (currentStatus?.isBuka === 1) {
          const lastUpdate = new Date(currentStatus.updatedAt);
          const isUpdatedToday = lastUpdate.toDateString() === wibNow.toDateString();
          const updatedHour = lastUpdate.getHours();

          if (!(isUpdatedToday && updatedHour >= 17)) {
            await db.update(shop_status).set({
              isBuka: 0,
              reason: "Sistem Otomatis: Tidak ada aktivitas",
              updatedAt: new Date(),
            });
          }
        }
      }
    }
  }

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
    } else {
      const [newReportLibur] = await db.insert(daily_reports).values({
        actualRevenue: 0,
        systemRevenue: 0,
        note: "Sistem Otomatis: Tidak ada pesanan (Libur/Tutup)",
        createdAt: shiftEnd,
      }).returning({ id: daily_reports.id });

      const currentStocksLibur = await db.select().from(stock);
      if (currentStocksLibur.length > 0) {
        await db.insert(daily_stock_snapshots).values(
          currentStocksLibur.map((s) => ({
            reportId: newReportLibur.id,
            stockId: s.id,
            sisaQuantity: s.quantity || 0,
            createdAt: shiftEnd,
          })),
        );
      }
      if (i === 0) {
        const currentStatus = await db.query.shop_status.findFirst();
        if (currentStatus) {
          const lastUpdate = new Date(currentStatus.updatedAt);
          const isUpdatedToday = lastUpdate.toDateString() === wibNow.toDateString();
          
          if (!(isUpdatedToday && currentStatus.isBuka === 1)) {
            await db.update(shop_status).set({
              isBuka: 0,
              reason: "Sistem Otomatis: Kemarin Libur",
              updatedAt: new Date(),
            });
          }
        }
      }
    }
  }
}
