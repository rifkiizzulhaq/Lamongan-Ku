"use server";

import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, asc, and, gte, lte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { getShiftWaktu } from "@/src/utils/date";

import { sql, SQL } from "drizzle-orm";

export async function getActiveAntrean(page: number = 1, limit: number = 10, prioritizeNonLele: boolean = false) {
  try {
    await requireAuth();
    const { startOfDay, endOfDay } = getShiftWaktu();

    let orderByClause: SQL[] = [asc(orders.createdAt)];

    if (prioritizeNonLele) {
      const hasLele = sql`EXISTS (
        SELECT 1 FROM order_items oi
        JOIN stock s ON oi.stock_id = s.id
        WHERE oi.order_id = orders.id AND s.name ILIKE '%lele%'
      )`;
      orderByClause = [asc(hasLele), asc(orders.createdAt)];
    }

    const activeOrders = await db.query.orders.findMany({
      where: and(
        eq(orders.status, "sedang di prosess.."),
        gte(orders.createdAt, startOfDay),
        lte(orders.createdAt, endOfDay)
      ),
      orderBy: orderByClause,
      limit,
      offset: (page - 1) * limit,
      with: {
        diningTable: true,
        items: {
          with: {
            stock: true,
          },
        },
      },
    });

    const totalOrdersResult = await db
      .select({ count: orders.id })
      .from(orders)
      .where(
        and(
          eq(orders.status, "sedang di prosess.."),
          gte(orders.createdAt, startOfDay),
          lte(orders.createdAt, endOfDay)
        )
      );

    const totalOrders = totalOrdersResult.length;
    const hasNextPage = totalOrders > page * limit;

    return {
      orders: activeOrders,
      hasNextPage,
    };
  } catch (error) {
    console.error("Error fetching active antrean:", error);
    return { orders: [], hasNextPage: false };
  }
}

export async function assignTableToOrder(orderId: number, tableId: number) {
  try {
    await requireAuth();

    await db
      .update(orders)
      .set({ diningTableId: tableId, orderType: "makan" })
      .where(eq(orders.id, orderId));

    revalidatePath("/meja");
    revalidatePath(`/meja/${tableId}`);

    return { success: true };
  } catch (error) {
    console.error("Error assigning table:", error);
    return { success: false, error: "Gagal menetapkan meja" };
  }
}

export async function getAllTables() {
  try {
    await requireAuth();
    const tables = await db.query.dining_table.findMany({
      orderBy: (tables, { asc }) => [asc(tables.name)],
    });
    return tables;
  } catch (error) {
    console.error("Error getting tables:", error);
    return [];
  }
}

export async function updateCustomerType(orderId: number, type: string) {
  try {
    await requireAuth();

    await db
      .update(orders)
      .set({ customerType: type })
      .where(eq(orders.id, orderId));

    revalidatePath("/meja");
    revalidatePath("/antrean");

    return { success: true };
  } catch (error) {
    console.error("Error updating customer type:", error);
    return { success: false, error: "Gagal mengupdate tipe pesanan" };
  }
}

export async function togglePinOrder(orderId: number, isPinned: boolean) {
  try {
    await requireAuth();

    await db
      .update(orders)
      .set({ isPinned })
      .where(eq(orders.id, orderId));

    revalidatePath("/antrean");
    revalidatePath("/bungkus");
    revalidatePath("/meja");

    return { success: true };
  } catch (error) {
    console.error("Error toggling pin order:", error);
    return { success: false, error: "Gagal menyematkan pesanan" };
  }
}

