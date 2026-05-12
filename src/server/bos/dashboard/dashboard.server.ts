"use server";

import { db } from "@/db";
import { orders, order_items, stock, daily_reports } from "@/db/schema";
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
      with: { weathers: true },
      orderBy: (reports, { desc }) => [desc(reports.createdAt)],
    });

    const EXCLUDED_ITEMS = ["sambal", "teh manis", "nasi"];
    const sisaBahan = await db
      .select({
        id: stock.id,
        nama: stock.name,
        sisa: stock.quantity,
      })
      .from(stock)
      .where(
        and(
          sql`${stock.quantity} IS NOT NULL`,
          ...EXCLUDED_ITEMS.map(
            (item) =>
              sql`lower(${stock.name}) NOT LIKE ${"%" + item.toLowerCase() + "%"}`,
          ),
        ),
      );

    return {
      pendapatan,
      pesananCount,
      sisaBahan,
      note: report?.note || null,
      weathers: report?.weathers || [],
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return {
      pendapatan: 0,
      pesananCount: 0,
      sisaBahan: [],
      note: null,
      weathers: [],
    };
  }
}

export async function getRevenueChartData() {
  noStore();
  const { startOfDay, endOfDay } = getShiftWaktu();

  try {
    const rawData = await db
      .select({
        type: orders.orderType,
        qty: order_items.quantity,
        created_at: orders.createdAt,
      })
      .from(order_items)
      .innerJoin(orders, eq(order_items.orderId, orders.id))
      .where(
        and(
          gte(orders.createdAt, startOfDay),
          lte(orders.createdAt, endOfDay),
          eq(orders.status, "selesai"),
        ),
      );

    return rawData.map((item) => ({
      type: item.type === "bungkus" ? "Bungkus" : "Makan Sini",
      qty: Number(item.qty),
      created_at: item.created_at.toISOString(),
    }));
  } catch (error) {
    console.error("Revenue Chart Data Error:", error);
    return [];
  }
}

export async function saveActualRevenue(actualRevenue: number) {
  try {
    const { startOfDay, endOfDay } = getShiftWaktu();

    const report = await db.query.daily_reports.findFirst({
      where: and(
        gte(daily_reports.createdAt, startOfDay),
        lte(daily_reports.createdAt, endOfDay),
      ),
    });

    if (!report) {
      return {
        success: false,
        error: "Laporan hari ini belum dibuat (belum ada transaksi)",
      };
    }

    await db
      .update(daily_reports)
      .set({ actualRevenue })
      .where(eq(daily_reports.id, report.id));

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
    const updatePromises = items.map((item) =>
      db
        .update(stock)
        .set({ quantity: item.sisa })
        .where(eq(stock.id, item.stockId)),
    );

    await Promise.all(updatePromises);
    revalidatePath("/dashboard");
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    console.error("Error updating stock inventory:", error);
    return { success: false, error: "Gagal mengupdate stok" };
  }
}
