"use server";

import { db } from "@/db";
import {
  orders,
  order_items,
  stock,
  daily_reports,
  daily_stock_snapshots,
} from "@/db/schema";
import { gte, lte, and, sql, eq } from "drizzle-orm";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { getShiftWaktu } from "@/src/utils/date";

export async function getDashboardStats() {
  noStore();
  const { startOfDay, endOfDay } = getShiftWaktu();

  try {
    const todayOrders = await db
      .select({
        total: sql<number>`coalesce(sum(${orders.totalPrice}), 0)`,
        count: sql<number>`coalesce(count(${orders.id}), 0)`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startOfDay),
          lte(orders.createdAt, endOfDay),
          eq(orders.status, "selesai"),
        ),
      );

    const pendapatan = Number(todayOrders[0]?.total || 0);
    const pesananCount = Number(todayOrders[0]?.count || 0);

    const report = await db.query.daily_reports.findFirst({
      where: and(
        gte(daily_reports.createdAt, startOfDay),
        lte(daily_reports.createdAt, endOfDay),
      ),
      with: {
        weathers: true,
        snapshots: {
          with: { stock: true },
        },
      },
      orderBy: (reports, { desc }) => [desc(reports.id)],
    });

    const isClosed =
      !!report && report.snapshots && report.snapshots.length > 0;

    let sisaBahan = [];
    if (isClosed) {
      sisaBahan = (report.snapshots || [])
        .sort((a, b) => a.stockId - b.stockId)
        .map((s) => ({
          id: s.stockId,
          nama: s.stock.name,
          sisa: s.sisaQuantity,
        }));
    } else {
      const currentStock = await db.select().from(stock).orderBy(stock.id);

      sisaBahan = currentStock.map((s) => ({
        id: s.id,
        nama: s.name,
        sisa: s.quantity,
      }));
    }

    return {
      pendapatan,
      pendapatanFisik: report?.actualRevenue || 0,
      pesananCount,
      sisaBahan,
      note: report?.note || null,
      weathers: report?.weathers || [],
      isClosed: isClosed,
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return {
      pendapatan: 0,
      pendapatanFisik: 0,
      pesananCount: 0,
      sisaBahan: [],
      note: null,
      weathers: [],
      isClosed: false,
    };
  }
}

export async function getRevenueChartData() {
  noStore();
  const { startOfDay: start, endOfDay: end } = getShiftWaktu();

  try {
    const data = await db
      .select({
        qty: sql<number>`coalesce(sum(${order_items.quantity}), 0)`,
        type: orders.orderType,
        created_at: orders.createdAt,
      })
      .from(orders)
      .leftJoin(order_items, eq(orders.id, order_items.orderId))
      .where(
        and(
          gte(orders.createdAt, start),
          lte(orders.createdAt, end),
          eq(orders.status, "selesai"),
        ),
      )
      .groupBy(orders.id, orders.orderType, orders.createdAt);

    return data.map((d) => ({
      qty: Number(d.qty),
      type: d.type === "bungkus" ? "Bungkus" : "Makan Sini",
      created_at: d.created_at.toISOString(),
    }));
  } catch (error) {
    console.error("Revenue Chart Data Error:", error);
    return [];
  }
}

export async function saveActualRevenue(val: number) {
  try {
    const { startOfDay, endOfDay } = getShiftWaktu();

    const report = await db.query.daily_reports.findFirst({
      where: and(
        gte(daily_reports.createdAt, startOfDay),
        lte(daily_reports.createdAt, endOfDay),
      ),
      orderBy: (reports, { desc }) => [desc(reports.id)],
    });

    if (!report) {
      return { success: false, error: "Laporan hari ini belum dibuat" };
    }

    await db
      .update(daily_reports)
      .set({ actualRevenue: val })
      .where(eq(daily_reports.id, report.id));

    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error saving actual revenue:", error);
    return { success: false, error: "Gagal menyimpan data" };
  }
}

export async function updateStockInventory(
  items: { stockId: number; sisa: number }[],
) {
  try {
    const { startOfDay, endOfDay } = getShiftWaktu();

    for (const item of items) {
      await db
        .update(stock)
        .set({ quantity: item.sisa })
        .where(eq(stock.id, item.stockId));
    }

    const report = await db.query.daily_reports.findFirst({
      where: and(
        gte(daily_reports.createdAt, startOfDay),
        lte(daily_reports.createdAt, endOfDay),
      ),
      orderBy: (reports, { desc }) => [desc(reports.id)],
    });

    if (report) {
      for (const item of items) {
        await db
          .update(daily_stock_snapshots)
          .set({ sisaQuantity: item.sisa })
          .where(
            and(
              eq(daily_stock_snapshots.reportId, report.id),
              eq(daily_stock_snapshots.stockId, item.stockId),
            ),
          );
      }
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating stock inventory:", error);
    return {
      success: false,
      error:
        "Gagal simpan: " +
        (error instanceof Error ? error.message : "Database Error"),
    };
  }
}
