"use server";

import { db } from "@/db";
import { orders, order_items, stock, dining_table, daily_reports } from "@/db/schema";
import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTablesWithOrders() {
  try {
    const allTables = await db.query.dining_table.findMany({
      orderBy: [dining_table.createdAt],
      with: {
        orders: {
          where: and(eq(orders.orderType, "makan"), ne(orders.status, "selesai")),
        },
      },
    });

    return allTables.map((t) => ({
      id: t.id,
      name: t.name,
      activeOrdersCount: t.orders.length,
    }));
  } catch (error) {
    console.error("Error fetching tables:", error);
    return [];
  }
}

export async function getOrdersByTable(tableId: number) {
  try {
    const activeOrders = await db.query.orders.findMany({
      where: and(
        eq(orders.diningTableId, tableId),
        eq(orders.orderType, "makan"),
        ne(orders.status, "selesai")
      ),
      orderBy: [orders.createdAt],
      with: { items: { with: { stock: true } } },
    });

    return activeOrders.map((order) => ({
      id: order.id.toString(),
      totalPrice: order.totalPrice,
      status: order.status,
      tipe: order.customerType || "Rombongan",
      items: order.items.map((item) => ({
        n: item.stock.name,
        q: item.quantity,
        isTakeaway: item.isTakeaway === "true",
      })),
    }));
  } catch (error) {
    console.error("Error fetching orders for table:", error);
    return [];
  }
}

export async function getTableById(tableId: number) {
  try {
    const table = await db.query.dining_table.findFirst({
      where: eq(dining_table.id, tableId),
    });
    return table || null;
  } catch {
    return null;
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
      customerType: order.customerType,
      diningTableId: order.diningTableId,
      cartItems: order.items.map((item) => ({
        stockId: item.stockId,
        name: item.stock.name,
        price: item.pricePerItem,
        quantity: item.quantity,
        isTakeaway: item.isTakeaway === "true",
      })),
    };
  } catch {
    return null;
  }
}

export async function createMakanOrder(
  tableId: number,
  customerType: string,
  items: { stockId: number; quantity: number; isTakeaway?: boolean }[]
) {
  try {
    if (items.length === 0) return { success: false, error: "Keranjang kosong" };

    const stockData = await db.query.stock.findMany({
      where: inArray(
        stock.id,
        items.map((i) => i.stockId)
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
        isTakeaway: item.isTakeaway ? "true" : "false",
      };
    });

    const [newOrder] = await db
      .insert(orders)
      .values({
        orderType: "makan",
        customerType,
        diningTableId: tableId,
        totalPrice,
      })
      .returning();

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

    revalidatePath("/meja");
    revalidatePath(`/meja/${tableId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating makan order:", error);
    return { success: false, error: "Gagal membuat pesanan" };
  }
}

export async function updateMakanItems(
  orderId: number,
  items: { stockId: number; quantity: number; isTakeaway?: boolean }[]
) {
  try {
    if (items.length === 0) return { success: false, error: "Keranjang kosong" };

    const orderInfo = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      columns: { diningTableId: true },
    });

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
        isTakeaway: item.isTakeaway ? "true" : "false",
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

    if (orderInfo?.diningTableId) {
      revalidatePath(`/meja/${orderInfo.diningTableId}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating makan items:", error);
    return { success: false, error: "Gagal mengupdate pesanan" };
  }
}

export async function deleteMakanOrder(orderId: number) {
  try {
    const orderInfo = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      columns: { diningTableId: true },
    });

    const oldItems = await db.query.order_items.findMany({
      where: eq(order_items.orderId, orderId),
    });

    const stockData = await db.query.stock.findMany({
      where: inArray(
        stock.id,
        oldItems.map((i) => i.stockId)
      ),
    });

    const stockDelta: Record<number, number> = {};
    for (const old of oldItems) {
      stockDelta[old.stockId] = (stockDelta[old.stockId] ?? 0) + old.quantity;
    }

    const restorePromises = Object.entries(stockDelta).map(([stockIdStr, qty]) => {
      const stockId = parseInt(stockIdStr);
      const s = stockData.find((st) => st.id === stockId);
      if (!s || s.quantity === null) return Promise.resolve();
      const newQty = s.quantity + qty;
      return db
        .update(stock)
        .set({ quantity: newQty })
        .where(eq(stock.id, stockId));
    });

    await Promise.all([
      db.delete(orders).where(eq(orders.id, orderId)),
      ...restorePromises,
    ]);
    
    if (orderInfo?.diningTableId) {
      revalidatePath(`/meja/${orderInfo.diningTableId}`);
    }
    revalidatePath("/meja");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting makan order:", error);
    return { success: false };
  }
}

export async function payMakanOrder(orderId: number) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    if (!order) return { success: false };

    await db.update(orders).set({ status: "selesai" }).where(eq(orders.id, orderId));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentReport = await db.query.daily_reports.findFirst({
      orderBy: (reports, { desc }) => [desc(reports.createdAt)],
    });

    if (!currentReport || currentReport.createdAt < today) {
      const [newReport] = await db
        .insert(daily_reports)
        .values({ systemRevenue: 0, actualRevenue: 0 })
        .returning();
      currentReport = newReport;
    }

    const newSystemRevenue = currentReport.systemRevenue + order.totalPrice;
    await db
      .update(daily_reports)
      .set({ systemRevenue: newSystemRevenue })
      .where(eq(daily_reports.id, currentReport.id));

    if (order.diningTableId) {
      revalidatePath(`/meja/${order.diningTableId}`);
    }
    revalidatePath("/meja");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error paying makan order:", error);
    return { success: false };
  }
}
