"use server";

import { db } from "@/db";
import {
  daily_reports,
  weather_logs,
  daily_stock_snapshots,
  stock,
  orders,
} from "@/db/schema";
import { eq, and, gte, lte, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getShiftWaktu } from "@/src/utils/date";

interface ClosingReportPayload {
  note?: string;
  weatherSlots: { jam: string; cuaca: string | null }[];
  stockSnapshots: { stockId: number; sisa: number }[];
}

export async function checkIfReportedToday() {
  const { startOfDay, endOfDay } = getShiftWaktu();
  const existing = await db.query.daily_reports.findFirst({
    where: and(
      gte(daily_reports.createdAt, startOfDay),
      lte(daily_reports.createdAt, endOfDay),
    ),
    with: { weathers: true },
  });

  return !!(existing && existing.weathers.length > 0);
}

export async function saveClosingReport(payload: ClosingReportPayload) {
  try {
    const { startOfDay, endOfDay } = getShiftWaktu();

    const activeOrders = await db.query.orders.findFirst({
      where: and(
        gte(orders.createdAt, startOfDay),
        lte(orders.createdAt, endOfDay),
        ne(orders.status, "selesai"),
      ),
    });

    if (activeOrders) {
      return {
        success: false,
        error:
          "Tidak bisa tutup warung! Masih ada pesanan yang belum diselesaikan (status belum Selesai).",
      };
    }

    const existing = await db.query.daily_reports.findFirst({
      where: and(
        gte(daily_reports.createdAt, startOfDay),
        lte(daily_reports.createdAt, endOfDay),
      ),
    });

    let reportId: number;

    if (existing) {
      const hasWeather = await db.query.weather_logs.findFirst({
        where: eq(weather_logs.reportId, existing.id),
      });

      if (hasWeather) {
        return {
          success: false,
          error: "Laporan untuk hari ini sudah terkirim.",
        };
      }

      await db
        .update(daily_reports)
        .set({ note: payload.note || null })
        .where(eq(daily_reports.id, existing.id));
      reportId = existing.id;
    } else {
      const [newReport] = await db
        .insert(daily_reports)
        .values({
          note: payload.note || null,
          systemRevenue: 0,
          actualRevenue: 0,
        })
        .returning();
      reportId = newReport.id;
    }

    const weatherData = payload.weatherSlots
      .filter((s) => s.cuaca !== null)
      .map((s) => ({
        reportId: reportId,
        timeRange: s.jam,
        weather: s.cuaca as string,
      }));

    if (weatherData.length > 0) {
      await db.insert(weather_logs).values(weatherData);
    }

    const snapshotData = payload.stockSnapshots.map((s) => ({
      reportId: reportId,
      stockId: s.stockId,
      sisaQuantity: s.sisa,
    }));

    if (snapshotData.length > 0) {
      await db.insert(daily_stock_snapshots).values(snapshotData);

      for (const item of payload.stockSnapshots) {
        await db
          .update(stock)
          .set({ quantity: item.sisa })
          .where(eq(stock.id, item.stockId));
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/more");

    return { success: true };
  } catch (error) {
    console.error("Error saving closing report:", error);
    return { success: false, error: "Gagal menyimpan laporan" };
  }
}
