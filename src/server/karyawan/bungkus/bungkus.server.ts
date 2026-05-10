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

export async function updateItems(
  orderId: number,
  items: { stockId: number; quantity: number }[],
) {
  try {
    if (items.length === 0) return { success: false };

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

    const updatePromises = Object.entries(stockDelta).map(([stockIdStr, delta]) => {
      const stockId = parseInt(stockIdStr);
      const s = stockData.find((st) => st.id === stockId);
      if (!s || s.quantity === null) return Promise.resolve();
      const newQty = Math.max(s.quantity + delta, 0);
      return db
        .update(stock)
        .set({ quantity: newQty })
        .where(eq(stock.id, stockId));
    });

    await Promise.all([
      db.delete(order_items).where(eq(order_items.orderId, orderId)),
      db.update(orders).set({ totalPrice }).where(eq(orders.id, orderId)),
      ...updatePromises,
    ]);

    await db
      .insert(order_items)
      .values(orderItemValues.map((v) => ({ ...v, orderId })));

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

    const stockDelta: Record<number, number> = {};
    for (const item of items) {
      stockDelta[item.stockId] = (stockDelta[item.stockId] ?? 0) + item.quantity;
    }

    const updatePromises = Object.entries(stockDelta).map(([stockIdStr, qty]) => {
      const stockId = parseInt(stockIdStr);
      const s = stockData.find((st) => st.id === stockId);
      if (!s || s.quantity === null) return Promise.resolve();
      const newQty = Math.max(s.quantity - qty, 0);
      return db
        .update(stock)
        .set({ quantity: newQty })
        .where(eq(stock.id, stockId));
    });

    await Promise.all([
      db.insert(order_items).values(orderItemValues.map((v) => ({ ...v, orderId: newOrder.id }))),
      ...updatePromises,
    ]);

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
    const oldItems = await db.query.order_items.findMany({
      where: eq(order_items.orderId, orderId),
    });

    for (const item of oldItems) {
      const s = await db.query.stock.findFirst({
        where: eq(stock.id, item.stockId),
      });
      if (!s || s.quantity === null) continue;
      await db
        .update(stock)
        .set({ quantity: s.quantity + item.quantity })
        .where(eq(stock.id, item.stockId));
    }

    await db.delete(orders).where(eq(orders.id, orderId));
    revalidatePath("/bungkus");
    return { success: true };
  } catch {
    return { success: false };
  }
}
