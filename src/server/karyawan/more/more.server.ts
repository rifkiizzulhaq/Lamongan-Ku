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
import { checkAndRunAutoClose } from "../../bos/laporan/auto-close.server";
import { requireAuth } from "@/lib/auth-guard";
import { z } from "zod";

const closingReportSchema = z.object({
  note: z.string().optional(),
  weatherSlots: z.array(
    z.object({
      jam: z.string(),
      cuaca: z.string().nullable(),
    }),
  ),
  stockSnapshots: z.array(
    z.object({
      stockId: z.number().int().positive(),
      sisa: z.number().int().min(0),
    }),
  ),
});

interface ClosingReportPayload {
  note?: string;
  weatherSlots: { jam: string; cuaca: string | null }[];
  stockSnapshots: { stockId: number; sisa: number }[];
}

import { unstable_noStore as noStore } from "next/cache";

export async function checkIfReportedToday() {
  noStore();
  await requireAuth();
  await checkAndRunAutoClose();
  const status = await db.query.shop_status.findFirst();
  if (status && status.isBuka === 0) {
    return true;
  }

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
    await requireAuth();
    payload = closingReportSchema.parse(payload);
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

    const shiftOrders = await db.query.orders.findMany({
      where: and(
        gte(orders.createdAt, startOfDay),
        lte(orders.createdAt, endOfDay),
      ),
    });
    const totalRev = shiftOrders.reduce((acc, o) => acc + o.totalPrice, 0);

    let reportId: number;

    await db.transaction(async (tx) => {
      if (existing) {
        const hasWeather = await tx.query.weather_logs.findFirst({
          where: eq(weather_logs.reportId, existing.id),
        });

        if (hasWeather) {
          throw new Error("Laporan untuk hari ini sudah terkirim.");
        }

        await tx
          .update(daily_reports)
          .set({
            note: payload.note || null,
            systemRevenue: totalRev,
            actualRevenue: totalRev,
          })
          .where(eq(daily_reports.id, existing.id));
        reportId = existing.id;
      } else {
        const [newReport] = await tx
          .insert(daily_reports)
          .values({
            note: payload.note || null,
            systemRevenue: totalRev,
            actualRevenue: totalRev,
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
        await tx.insert(weather_logs).values(weatherData);
      }

      const snapshotData = payload.stockSnapshots.map((s) => ({
        reportId: reportId,
        stockId: s.stockId,
        sisaQuantity: s.sisa,
      }));

      if (snapshotData.length > 0) {
        await tx.insert(daily_stock_snapshots).values(snapshotData);

        for (const item of payload.stockSnapshots) {
          await tx
            .update(stock)
            .set({ quantity: 0 })
            .where(eq(stock.id, item.stockId));
        }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/more");

    return { success: true };
  } catch (error) {
    console.error("Error saving closing report:", error);
    if (error instanceof Error && error.message === "Laporan untuk hari ini sudah terkirim.") {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Gagal menyimpan laporan" };
  }
}

export async function getTodayOrderCount() {
  noStore();
  await requireAuth();
  const { startOfDay, endOfDay } = getShiftWaktu();
  const shiftOrders = await db.query.orders.findMany({
    where: and(
      gte(orders.createdAt, startOfDay),
      lte(orders.createdAt, endOfDay),
    ),
    columns: { id: true },
  });
  return shiftOrders.length;
}
