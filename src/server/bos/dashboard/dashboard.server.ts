"use server";

import { db } from "@/db";
import {
  orders,
  order_items,
  stock,
  daily_reports,
  daily_stock_snapshots,
  shop_status,
  dining_table,
} from "@/db/schema";
import { gte, lte, and, sql, eq } from "drizzle-orm";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { getShiftWaktu } from "@/src/utils/date";
import { checkAndRunAutoClose } from "@/src/server/bos/laporan/laporan.server";
import { requireAuth } from "@/lib/auth-guard";
import { z } from "zod";

const saveRevenueSchema = z.number().min(0);
const updateStockSchema = z.array(z.object({
  stockId: z.number().int().positive(),
  sisa: z.number().int().min(0)
}));

export async function getShopStatus() {
  noStore();
  await requireAuth();
  const status = await db.query.shop_status.findFirst();
  if (!status) {
    const [newStatus] = await db
      .insert(shop_status)
      .values({ isBuka: 1 })
      .returning();
    return newStatus;
  }
  return status;
}

export async function updateShopStatus(isBuka: boolean, reason?: string) {
  try {
    await requireAuth(["bos"]);
    const current = await getShopStatus();

    if (isBuka) {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jakarta",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });
      const parts = formatter.formatToParts(now);
      const nowHour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
      const nowMin = parseInt(parts.find((p) => p.type === "minute")?.value || "0");

      if (nowHour > 18 || (nowHour === 18 && nowMin >= 30) || nowHour < 6) {
        return {
          success: false,
          error: "Sudah melewati batas waktu (18:30) untuk membuka warung hari ini. Harap tunggu shift berikutnya.",
        };
      }
    }

    await db
      .update(shop_status)
      .set({
        isBuka: isBuka ? 1 : 0,
        reason: isBuka ? null : reason || null,
        updatedAt: new Date(),
      })
      .where(eq(shop_status.id, current.id));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating shop status:", error);
    return { success: false, error: "Gagal memperbarui status warung" };
  }
}

export async function getDashboardStats() {
  noStore();
  await requireAuth(["bos"]);
  checkAndRunAutoClose().catch(console.error);
  const { startOfDay, endOfDay } = getShiftWaktu();
  const shopStatus = await getShopStatus();

  try {
    const [todayOrders, report, currentStock] = await Promise.all([
      db
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
        ),
      db.query.daily_reports.findFirst({
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
      }),
      db.select().from(stock).orderBy(stock.id),
    ]);

    const pendapatan = Number(todayOrders[0]?.total || 0);
    const pesananCount = Number(todayOrders[0]?.count || 0);

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
      shopStatus,
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
  await requireAuth(["bos"]);
  const { startOfDay: start, endOfDay: end } = getShiftWaktu();

  try {
    const data = await db
      .select({
        qty: order_items.quantity,
        menuName: stock.name,
        type: orders.orderType,
        customerType: orders.customerType,
        isTakeaway: order_items.isTakeaway,
        tableName: dining_table.name,
        created_at: orders.createdAt,
      })
      .from(orders)
      .innerJoin(order_items, eq(orders.id, order_items.orderId))
      .innerJoin(stock, eq(order_items.stockId, stock.id))
      .leftJoin(dining_table, eq(orders.diningTableId, dining_table.id))
      .where(
        and(
          gte(orders.createdAt, start),
          lte(orders.createdAt, end),
          eq(orders.status, "selesai"),
        ),
      );

    return data.map((d) => ({
      qty: Number(d.qty),
      menuName: d.menuName,
      tableName: d.tableName ?? null,
      isTakeaway: d.isTakeaway === "true",
      type: d.type === "bungkus" ? "Bungkus" : "Makan Sini",
      customerType: d.customerType ?? "-",
      created_at: d.created_at.toISOString(),
    }));
  } catch (error) {
    console.error("Revenue Chart Data Error:", error);
    return [];
  }
}

export async function saveActualRevenue(val: number) {
  try {
    await requireAuth(["bos"]);
    val = saveRevenueSchema.parse(val);
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
    await requireAuth(["bos"]);
    items = updateStockSchema.parse(items);
    const { startOfDay, endOfDay } = getShiftWaktu();

    await Promise.all(
      items.map((item) =>
        db
          .update(stock)
          .set({ quantity: item.sisa, updatedAt: new Date() })
          .where(eq(stock.id, item.stockId))
      )
    );

    const report = await db.query.daily_reports.findFirst({
      where: and(
        gte(daily_reports.createdAt, startOfDay),
        lte(daily_reports.createdAt, endOfDay),
      ),
      orderBy: (reports, { desc }) => [desc(reports.id)],
    });

    if (report) {
      await Promise.all(
        items.map((item) =>
          db
            .update(daily_stock_snapshots)
            .set({ sisaQuantity: item.sisa })
            .where(
              and(
                eq(daily_stock_snapshots.reportId, report.id),
                eq(daily_stock_snapshots.stockId, item.stockId),
              ),
            )
        )
      );
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
