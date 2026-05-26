"use server";

import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function getActiveAntrean(page: number = 1, limit: number = 10) {
  try {
    await requireAuth();

    const activeOrders = await db.query.orders.findMany({
      where: eq(orders.status, "sedang di prosess.."),
      orderBy: [asc(orders.createdAt)],
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
      .where(eq(orders.status, "sedang di prosess.."));

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
