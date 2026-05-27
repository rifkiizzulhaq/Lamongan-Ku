"use server";

import { db } from "@/db";
import { orders, order_items, stock } from "@/db/schema";
import { and, eq, inArray, ne, gte, lte, count, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getShiftWaktu } from "@/src/utils/date";
import { requireAuth } from "@/lib/auth-guard";
import { z } from "zod";

const orderItemSchema = z.object({
  stockId: z.number().int().positive(),
  quantity: z.number().int().min(1),
  price: z.number().int().positive().optional(),
});

const updateItemsSchema = z.object({
  orderId: z.number().int().positive(),
  items: z.array(orderItemSchema).min(1),
});

export async function getStock() {
  try {
    await requireAuth();
    const stocks = await db.select().from(stock).orderBy(stock.createdAt);

    return stocks;
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
        ne(orders.status, "dibatalkan"),
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

export async function create(
  items: { stockId: number; quantity: number; price?: number }[],
) {
  try {
    await requireAuth();
    const { startOfDay, endOfDay } = getShiftWaktu();

    if (items.length === 0)
      return { success: false, error: "Keranjang kosong" };

    let totalPrice = 0;
    const orderItemValues = items.map((item) => {
      const price = item.price ?? 0;
      const subtotal = price * item.quantity;
      totalPrice += subtotal;
      return {
        stockId: item.stockId,
        quantity: item.quantity,
        pricePerItem: price,
        subtotal,
        isTakeaway: "true",
      };
    });

    await db.transaction(async (tx) => {
      const lastOrderToday = await tx.query.orders.findFirst({
        where: and(
          gte(orders.createdAt, startOfDay),
          lte(orders.createdAt, endOfDay),
        ),
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      });

      let dailySequence = 1;
      if (lastOrderToday && lastOrderToday.label) {
        const match = lastOrderToday.label.match(/\d+$/);
        if (match) {
          dailySequence = parseInt(match[0], 10) + 1;
        } else {
          const todayOrdersCount = await tx
            .select({ val: count() })
            .from(orders)
            .where(
              and(
                gte(orders.createdAt, startOfDay),
                lte(orders.createdAt, endOfDay),
              ),
            );
          dailySequence = (todayOrdersCount[0]?.val ?? 0) + 1;
        }
      } else if (lastOrderToday) {
        const todayOrdersCount = await tx
          .select({ val: count() })
          .from(orders)
          .where(
            and(
              gte(orders.createdAt, startOfDay),
              lte(orders.createdAt, endOfDay),
            ),
          );
        dailySequence = (todayOrdersCount[0]?.val ?? 0) + 1;
      }

      const [newOrder] = await tx
        .insert(orders)
        .values({
          orderType: "bungkus",
          label: `B-${String(dailySequence).padStart(3, "0")}`,
          totalPrice,
        })
        .returning();

      await tx
        .insert(order_items)
        .values(orderItemValues.map((v) => ({ ...v, orderId: newOrder.id })));
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
    const orderInfo = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      columns: { status: true, createdAt: true },
    });

    if (!orderInfo) {
      return { success: false, error: "Pesanan tidak ditemukan" };
    }

    if (orderInfo.status === "selesai") {
      return {
        success: false,
        error: "Tidak bisa menghapus pesanan yang sudah selesai",
      };
    }

    const { startOfDay, endOfDay } = getShiftWaktu();
    if (orderInfo.createdAt < startOfDay || orderInfo.createdAt > endOfDay) {
      return {
        success: false,
        error: "Hanya bisa menghapus pesanan dari shift hari ini",
      };
    }

    await db.transaction(async (tx) => {
      await tx.delete(orders).where(eq(orders.id, orderId));

      const remainingOrders = await tx
        .select()
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, startOfDay),
            lte(orders.createdAt, endOfDay),
          )
        )
        .orderBy(asc(orders.createdAt));

      for (let i = 0; i < remainingOrders.length; i++) {
        const order = remainingOrders[i];
        const newSeq = i + 1;
        const prefix = order.orderType === "bungkus" ? "B" : "M";
        const newLabel = `${prefix}-${String(newSeq).padStart(3, "0")}`;
        if (order.label !== newLabel) {
          await tx.update(orders).set({ label: newLabel }).where(eq(orders.id, order.id));
        }
      }
    });

    revalidatePath("/bungkus");
    return { success: true };
  } catch (error) {
    console.error("Server error:", error);
    return { success: false, error: "Terjadi kesalahan pada server" };
  }
}
