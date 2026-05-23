"use server";

import { db } from "@/db";
import {
  orders,
  daily_reports,
  stock,
  daily_stock_snapshots,
  shop_status,
} from "@/db/schema";
import { and, gte, lte, inArray, eq } from "drizzle-orm";
import { getShiftDate, getAutoCloseTargetDate } from "./utils";

let activeAutoClosePromise: Promise<void> | null = null;

export async function checkAndRunAutoClose(): Promise<void> {
  if (activeAutoClosePromise) {
    await activeAutoClosePromise;
    return;
  }

  let resolvePromise: () => void = () => { };
  activeAutoClosePromise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });

  try {
    const anyStockUpdate = await db.query.stock.findFirst({
      where: (s, { ne }) => ne(s.updatedAt, s.createdAt),
    });
    if (!anyStockUpdate) return;

    const firstOrder = await db.query.orders.findFirst({
      orderBy: (o, { asc }) => asc(o.createdAt),
    });
    const launchShiftDate = firstOrder
      ? getShiftDate(firstOrder.createdAt)
      : null;

    if (!launchShiftDate) return;

    launchShiftDate.setHours(0, 0, 0, 0);

    const allReports = await db.select().from(daily_reports);
    const idsToDeletePreLaunch: number[] = [];
    for (const r of allReports) {
      const sd = getShiftDate(r.createdAt);
      sd.setHours(0, 0, 0, 0);
      if (sd.getTime() < launchShiftDate.getTime()) {
        idsToDeletePreLaunch.push(r.id);
      }
    }
    if (idsToDeletePreLaunch.length > 0) {
      await db
        .delete(daily_reports)
        .where(inArray(daily_reports.id, idsToDeletePreLaunch));
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const currentReports = await db.query.daily_reports.findMany({
      where: gte(daily_reports.createdAt, threeDaysAgo),
      with: { weathers: true },
    });
    if (currentReports.length > 0) {
      const grouped = new Map<string, typeof currentReports>();
      for (const r of currentReports) {
        const sd = getShiftDate(r.createdAt);
        const key = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, "0")}-${String(sd.getDate()).padStart(2, "0")}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(r);
      }

      const idsToDelete: number[] = [];
      for (const reports of grouped.values()) {
        if (reports.length > 1) {
          const sorted = [...reports].sort((a, b) => {
            const isAutoA = a.note?.includes("Sistem Otomatis:") ? 1 : 0;
            const isAutoB = b.note?.includes("Sistem Otomatis:") ? 1 : 0;
            if (isAutoA !== isAutoB) return isAutoA - isAutoB;

            const revA = a.actualRevenue ?? 0;
            const revB = b.actualRevenue ?? 0;
            if (revA !== revB) return revB - revA;

            return a.id - b.id;
          });
          const toDelete = sorted.slice(1);
          for (const d of toDelete) {
            idsToDelete.push(d.id);
          }
        }
      }

      if (idsToDelete.length > 0) {
        await db
          .delete(daily_reports)
          .where(inArray(daily_reports.id, idsToDelete));
      }
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const yToday = parseInt(parts.find((p) => p.type === "year")?.value || "0");
    const mTodayNum = parseInt(
      parts.find((p) => p.type === "month")?.value || "0",
    );
    const dTodayNum = parseInt(
      parts.find((p) => p.type === "day")?.value || "0",
    );
    const nowHour = parseInt(
      parts.find((p) => p.type === "hour")?.value || "0",
    );
    const nowMin = parseInt(
      parts.find((p) => p.type === "minute")?.value || "0",
    );

    const isPast1830 = nowHour > 18 || (nowHour === 18 && nowMin >= 30);

    const mToday = String(mTodayNum).padStart(2, "0");
    const dToday = String(dTodayNum).padStart(2, "0");
    const todayDate = new Date(`${yToday}-${mToday}-${dToday}T00:00:00+07:00`);

    const latestFixDate = getAutoCloseTargetDate();

    const latestCheckDate = isPast1830 ? todayDate : latestFixDate;

    const checkStartDate = new Date(latestCheckDate);
    checkStartDate.setDate(checkStartDate.getDate() - 13);
    checkStartDate.setHours(0, 0, 0, 0);

    const rangeEnd = new Date(latestCheckDate.getTime() + 30 * 60 * 60 * 1000);

    const [
      allRangeStocks,
      allRangeOrders,
      currentStocksBulk,
    ] = await Promise.all([
      db.query.stock.findMany({
        where: and(
          gte(stock.updatedAt, checkStartDate),
          lte(stock.updatedAt, rangeEnd),
        ),
      }),
      db.query.orders.findMany({
        where: and(
          gte(orders.createdAt, checkStartDate),
          lte(orders.createdAt, rangeEnd),
        ),
      }),
      db.select().from(stock),
    ]);

    const daysToCheck = Array.from({ length: 14 }, (_, idx) => 13 - idx);

    for (const i of daysToCheck) {
      const checkDate = new Date(latestCheckDate);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      if (launchShiftDate && checkDate.getTime() < launchShiftDate.getTime()) {
        continue;
      }

      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, "0");
      const dStr = String(checkDate.getDate()).padStart(2, "0");

      const shiftStart = new Date(`${y}-${m}-${dStr}T06:00:00+07:00`);
      const shiftEnd = new Date(shiftStart.getTime() + 24 * 60 * 60 * 1000 - 1000);
      const stockCheckStart = new Date(`${y}-${m}-${dStr}T06:00:00+07:00`);
      const stockCheckEnd = new Date(`${y}-${m}-${dStr}T18:30:00+07:00`);

      const existingReport = currentReports.find(
        (r) => r.createdAt >= shiftStart && r.createdAt <= shiftEnd,
      );

      const isCompletedReport = existingReport && (
        existingReport.weathers.length > 0 ||
        (existingReport.note && existingReport.note.includes("Sistem Otomatis:"))
      );

      if (isCompletedReport) continue;

      const stockSavedToday = allRangeStocks.find(
        (s) => s.updatedAt >= stockCheckStart && s.updatedAt <= stockCheckEnd,
      );

      const shiftOrders = allRangeOrders.filter(
        (o) => o.createdAt >= shiftStart && o.createdAt <= shiftEnd,
      );

      const wasActive = stockSavedToday !== undefined || shiftOrders.length > 0;

      const isToday = checkDate.getTime() === todayDate.getTime();

      if (isToday && wasActive) {
        continue;
      }

      if (wasActive && shiftOrders.length > 0) {
        const totalRevenue = shiftOrders.reduce(
          (acc, o) => acc + o.totalPrice,
          0,
        );
        let newReportId;
        if (existingReport) {
          await db
            .update(daily_reports)
            .set({
              actualRevenue: totalRevenue,
              systemRevenue: totalRevenue,
              note: "Sistem Otomatis: Karyawan lupa tutup warung",
              createdAt: shiftEnd,
            })
            .where(eq(daily_reports.id, existingReport.id));
          newReportId = existingReport.id;
        } else {
          const [newReport] = await db
            .insert(daily_reports)
            .values({
              actualRevenue: totalRevenue,
              systemRevenue: totalRevenue,
              note: "Sistem Otomatis: Karyawan lupa tutup warung",
              createdAt: shiftEnd,
            })
            .returning({ id: daily_reports.id });
          newReportId = newReport.id;
        }

        if (currentStocksBulk.length > 0) {
          await db.insert(daily_stock_snapshots).values(
            currentStocksBulk.map((s) => ({
              reportId: newReportId,
              stockId: s.id,
              sisaQuantity: s.quantity || 0,
              createdAt: shiftEnd,
            })),
          );
        }
      } else {
        if (!isToday) {
          let newReportId;
          if (existingReport) {
            await db
              .update(daily_reports)
              .set({
                actualRevenue: 0,
                systemRevenue: 0,
                note: "Sistem Otomatis: Tidak ada pesanan (Libur/Tutup)",
                createdAt: shiftEnd,
              })
              .where(eq(daily_reports.id, existingReport.id));
            newReportId = existingReport.id;
          } else {
            const [newReportLibur] = await db
              .insert(daily_reports)
              .values({
                actualRevenue: 0,
                systemRevenue: 0,
                note: "Sistem Otomatis: Tidak ada pesanan (Libur/Tutup)",
                createdAt: shiftEnd,
              })
              .returning({ id: daily_reports.id });
            newReportId = newReportLibur.id;
          }

          if (currentStocksBulk.length > 0) {
            await db.insert(daily_stock_snapshots).values(
              currentStocksBulk.map((s) => ({
                reportId: newReportId,
                stockId: s.id,
                sisaQuantity: s.quantity || 0,
                createdAt: shiftEnd,
              })),
            );
          }
        }
        if (i === 0 || isToday) {
          const currentStatus = await db.query.shop_status.findFirst();
          if (currentStatus && currentStatus.isBuka === 1) {
            const hasOrderAfter =
              allRangeOrders.find((o) => o.createdAt >= shiftEnd) ||
              (await db.query.orders.findFirst({
                where: gte(orders.createdAt, shiftEnd),
              }));

            const hasStockUpdateAfter =
              allRangeStocks.find((s) => s.updatedAt >= shiftEnd) ||
              (await db.query.stock.findFirst({
                where: gte(stock.updatedAt, shiftEnd),
              }));

            const hasActivityAfter =
              hasOrderAfter !== undefined || hasStockUpdateAfter !== undefined;
            const lastUpdate = new Date(currentStatus.updatedAt);
            const isUpdatedAfterShift =
              lastUpdate.getTime() > shiftEnd.getTime() || hasActivityAfter;

            if (!isUpdatedAfterShift) {
              await db.update(shop_status).set({
                isBuka: 0,
                reason: isToday
                  ? "Sistem Otomatis: Batas waktu buka warung terlewati (18:30)"
                  : "Sistem Otomatis: Kemarin Libur",
                updatedAt: new Date(),
              });
            }
          }
        }
      }
    }
  } finally {
    activeAutoClosePromise = null;
    resolvePromise();
  }
}
