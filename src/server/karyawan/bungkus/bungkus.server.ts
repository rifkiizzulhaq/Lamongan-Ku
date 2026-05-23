"use server";

import { db } from "@/db";
import { orders, order_items, stock } from "@/db/schema";
import { and, eq, inArray, ne, gte, lte, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkIfReportedToday } from "../more/more.server";
import { getShiftWaktu } from "@/src/utils/date";
import { requireAuth } from "@/lib/auth-guard";
import { z } from "zod";

const orderItemSchema = z.object({
  stockId: z.number().int().positive(),
  quantity: z.number().int().min(1),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
});

const updateItemsSchema = z.object({
  orderId: z.number().int().positive(),
  items: z.array(orderItemSchema).min(1),
});

export async function getStock() {
  try {
    await requireAuth();
    const stocks = await db.select().from(stock).orderBy(stock.createdAt);
    const { startOfDay } = getShiftWaktu();

    return stocks.map((s) => {
      if (s.isUnlimited === 0 && s.updatedAt < startOfDay) {
        return { ...s, quantity: 0 };
      }
      return s;
    });
  } catch (error) {
    console.error("Error fetching bungkus orders:", error);
    return [];
  }
}

export async function getAll(page = 1, limitNum = 5) {
  try {
    await requireAuth();
    const { startOfDay, endOfDay } = getShiftWaktu();
    const offsetNum = (page - 1) * limitNum;
    const bungkusOrders = await db.query.orders.findMany({
      where: and(
        eq(orders.orderType, "bungkus"),
        ne(orders.status, "selesai"),
        gte(orders.createdAt, startOfDay),
        lte(orders.createdAt, endOfDay),
      ),
      orderBy: [orders.createdAt],
      limit: limitNum,
      offset: offsetNum,
      with: { items: { with: { stock: true } } },
    });

    return bungkusOrders.map((order) => ({
      id: order.id.toString(),
      label: order.label || `B - ${order.id}`,
      totalPrice: order.totalPrice,
      status: order.status,
      items: order.items.map((item) => ({
        n: item.stock.name,
        q: item.quantity,
      })),
    }));
  } catch (error) {
    console.error("Error fetching bungkus orders:", error);
    return [];
  }
}

export async function getOrderById(orderId: number) {
  try {
    await requireAuth();
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { items: { with: { stock: true } } },
    });
    if (!order) return null;
    return {
      id: order.id,
      label: order.label || `B-${order.id}`,
      cartItems: order.items.map((item) => ({
        stockId: item.stockId,
        name: item.stock.name,
        price: item.pricePerItem,
        quantity: item.quantity,
      })),
    };
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return null;
  }
}

export async function updateItems(
  orderId: number,
  items: { stockId: number; quantity: number }[],
) {
  try {
    await requireAuth();
    const parsed = updateItemsSchema.parse({ orderId, items });
    orderId = parsed.orderId;
    items = parsed.items;

    if (items.length === 0)
      return { success: false, error: "Keranjang kosong" };

    const oldItems = await db.query.order_items.findMany({
      where: eq(order_items.orderId, orderId),
    });

    const allStockIds = [
      ...new Set([
        ...oldItems.map((i) => i.stockId),
        ...items.map((i) => i.stockId),
      ]),
    ];
    const stockData = await db.query.stock.findMany({
      where: inArray(stock.id, allStockIds),
    });

    const stockDelta: Record<number, number> = {};
    for (const old of oldItems) {
      stockDelta[old.stockId] = (stockDelta[old.stockId] ?? 0) + old.quantity;
    }
    for (const newItem of items) {
      stockDelta[newItem.stockId] =
        (stockDelta[newItem.stockId] ?? 0) - newItem.quantity;
    }

    let totalPrice = 0;
    const orderItemValues = items.map((item) => {
      const s = stockData.find((st) => st.id === item.stockId)!;
      const subtotal = s.price * item.quantity;
      totalPrice += subtotal;
      return {
        stockId: item.stockId,
        quantity: item.quantity,
        pricePerItem: s.price,
        subtotal,
        isTakeaway: "true",
      };
    });

    await db.transaction(async (tx) => {
      await tx.delete(order_items).where(eq(order_items.orderId, orderId));
      await tx.update(orders).set({ totalPrice }).where(eq(orders.id, orderId));

      const updatePromises = Object.entries(stockDelta).map(
        ([stockIdStr, delta]) => {
          const stockId = parseInt(stockIdStr);
          return tx
            .update(stock)
            .set({ quantity: sql`GREATEST(${stock.quantity} + ${delta}, 0)` })
            .where(eq(stock.id, stockId));
        },
      );
      await Promise.all(updatePromises);

      await tx
        .insert(order_items)
        .values(orderItemValues.map((v) => ({ ...v, orderId })));
    });

    revalidatePath("/bungkus");
    return { success: true };
  } catch (error) {
    console.error("Error updating bungkus items:", error);
    return { success: false, error: "Gagal mengupdate pesanan" };
  }
}

export async function create(items: { stockId: number; quantity: number }[]) {
  try {
    await requireAuth();
    const parsed = createOrderSchema.parse({ items });
    items = parsed.items;

    const isClosed = await checkIfReportedToday();
    if (isClosed) {
      return {
        success: false,
        error:
          "Warung sudah tutup! Tidak bisa membuat pesanan baru hingga shift berikutnya.",
      };
    }

    if (items.length === 0)
      return { success: false, error: "Keranjang kosong" };

    const stockData = await db.query.stock.findMany({
      where: inArray(
        stock.id,
        items.map((i) => i.stockId),
      ),
    });

    let totalPrice = 0;
    const orderItemValues = items.map((item) => {
      const s = stockData.find((st) => st.id === item.stockId)!;
      const subtotal = s.price * item.quantity;
      totalPrice += subtotal;
      return {
        stockId: item.stockId,
        quantity: item.quantity,
        pricePerItem: s.price,
        subtotal,
        isTakeaway: "true",
      };
    });

    const { startOfDay, endOfDay } = getShiftWaktu();

    const todayOrdersCount = await db
      .select({ val: count() })
      .from(orders)
      .where(
        and(
          eq(orders.orderType, "bungkus"),
          gte(orders.createdAt, startOfDay),
          lte(orders.createdAt, endOfDay),
        ),
      );

    const dailySequence = (todayOrdersCount[0]?.val ?? 0) + 1;

    await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(orders)
        .values({
          orderType: "bungkus",
          label: `B-${String(dailySequence).padStart(3, "0")}`,
          totalPrice,
        })
        .returning();

      const stockDelta: Record<number, number> = {};
      for (const item of items) {
        stockDelta[item.stockId] =
          (stockDelta[item.stockId] ?? 0) + item.quantity;
      }

      const updatePromises = Object.entries(stockDelta).map(
        ([stockIdStr, qty]) => {
          const stockId = parseInt(stockIdStr);
          return tx
            .update(stock)
            .set({ quantity: sql`GREATEST(${stock.quantity} - ${qty}, 0)` })
            .where(eq(stock.id, stockId));
        },
      );

      await Promise.all([
        tx
          .insert(order_items)
          .values(orderItemValues.map((v) => ({ ...v, orderId: newOrder.id }))),
        ...updatePromises,
      ]);
    });

    revalidatePath("/bungkus");
    return { success: true };
  } catch (error) {
    console.error("Error creating bungkus:", error);
    return { success: false };
  }
}

export async function update(orderId: number, status: string) {
  try {
    await requireAuth();
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
    revalidatePath("/bungkus");
    return { success: true };
  } catch (error) {
    console.error("Server error:", error);
    return { success: false, error: "Terjadi kesalahan pada server" };
  }
}

export async function deletes(orderId: number) {
  try {
    await requireAuth();
    const oldItems = await db.query.order_items.findMany({
      where: eq(order_items.orderId, orderId),
    });

    const stockDelta: Record<number, number> = {};
    for (const item of oldItems) {
      stockDelta[item.stockId] =
        (stockDelta[item.stockId] ?? 0) + item.quantity;
    }

    await db.transaction(async (tx) => {
      await tx.delete(orders).where(eq(orders.id, orderId));

      for (const [stockIdStr, qty] of Object.entries(stockDelta)) {
        const stockId = parseInt(stockIdStr);
        await tx
          .update(stock)
          .set({ quantity: sql`${stock.quantity} + ${qty}` })
          .where(eq(stock.id, stockId));
      }
    });

    revalidatePath("/bungkus");
    return { success: true };
  } catch (error) {
    console.error("Server error:", error);
    return { success: false, error: "Terjadi kesalahan pada server" };
  }
}
