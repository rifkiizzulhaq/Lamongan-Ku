"use server";

import { db } from "@/db";
import { orders, order_items, stock } from "@/db/schema";
import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getStock() {
  try {
    return await db.select().from(stock).orderBy(stock.createdAt);
  } catch {
    return [];
  }
}

export async function getAll() {
  try {
    const bungkusOrders = await db.query.orders.findMany({
      where: and(eq(orders.orderType, "bungkus"), ne(orders.status, "selesai")),
      orderBy: [orders.createdAt],
      with: { items: { with: { stock: true } } },
    });

    return bungkusOrders.map((order) => ({
      id: order.id.toString(),
      label: order.label || `B-${order.id}`,
      totalPrice: order.totalPrice,
      status: order.status,
      items: order.items.map((item) => ({
        n: item.stock.name,
        q: item.quantity,
      })),
    }));
  } catch {
    return [];
  }
}

// Ambil detail satu order untuk mode edit
export async function getOrderById(orderId: number) {
  try {
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
  } catch {
    return null;
  }
}

// Ganti semua items dalam order yang ada (untuk update)
export async function updateItems(
  orderId: number,
  items: { stockId: number; quantity: number }[],
) {
  try {
    if (items.length === 0) return { success: false };

    const stockData = await db.query.stock.findMany({
      where: inArray(stock.id, items.map((i) => i.stockId)),
    });

    let totalPrice = 0;
    const orderItemValues = items.map((item) => {
      const s = stockData.find((st) => st.id === item.stockId)!;
      const subtotal = s.price * item.quantity;
      totalPrice += subtotal;
      return { stockId: item.stockId, quantity: item.quantity, pricePerItem: s.price, subtotal, isTakeaway: "true" };
    });

    await db.delete(order_items).where(eq(order_items.orderId, orderId));
    await db.insert(order_items).values(orderItemValues.map((v) => ({ ...v, orderId })));
    await db.update(orders).set({ totalPrice }).where(eq(orders.id, orderId));

    revalidatePath("/bungkus");
    return { success: true };
  } catch (error) {
    console.error("Error updating bungkus items:", error);
    return { success: false };
  }
}

export async function create(items: { stockId: number; quantity: number }[]) {
  try {
    if (items.length === 0) return { success: false };

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

    const [newOrder] = await db
      .insert(orders)
      .values({ orderType: "bungkus", label: null, totalPrice })
      .returning();

    await db
      .update(orders)
      .set({ label: `B-${String(newOrder.id).padStart(3, "0")}` })
      .where(eq(orders.id, newOrder.id));

    await db
      .insert(order_items)
      .values(orderItemValues.map((v) => ({ ...v, orderId: newOrder.id })));

    for (const item of items) {
      const s = stockData.find((st) => st.id === item.stockId);
      if (!s) continue;
      const newQty = Math.max((s.quantity ?? 0) - item.quantity, 0);
      await db
        .update(stock)
        .set({ quantity: newQty })
        .where(eq(stock.id, item.stockId));
    }

    revalidatePath("/bungkus");
    return { success: true };
  } catch (error) {
    console.error("Error creating bungkus:", error);
    return { success: false };
  }
}

export async function update(orderId: number, status: string) {
  try {
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
    revalidatePath("/bungkus");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deletes(orderId: number) {
  try {
    await db.delete(orders).where(eq(orders.id, orderId));
    revalidatePath("/bungkus");
    return { success: true };
  } catch {
    return { success: false };
  }
}
