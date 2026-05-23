"use server";

import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, gte, lte, and, desc, count } from "drizzle-orm";
import { getShiftWaktu } from "@/src/utils/date";
import { requireAuth } from "@/lib/auth-guard";

export async function getHistory(page: number = 1, limitNum: number = 10) {
  await requireAuth();
  const { startOfDay, endOfDay } = getShiftWaktu();

  const baseWhere = and(
    eq(orders.status, "selesai"),
    gte(orders.createdAt, startOfDay),
    lte(orders.createdAt, endOfDay),
  );

  const [countResult] = await db
    .select({ total: count() })
    .from(orders)
    .where(baseWhere);
  const totalToday = countResult.total;

  const result = await db.query.orders.findMany({
    where: baseWhere,
    with: {
      items: {
        with: {
          stock: true,
        },
      },
    },
    orderBy: [desc(orders.createdAt)],
    limit: limitNum,
    offset: (page - 1) * limitNum,
  });

  return result.map((order, index) => {
    const sequenceNumber = totalToday - ((page - 1) * limitNum + index);

    const date = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    })
      .format(order.createdAt)
      .replace(/\./g, ":");

    let titleId = "";
    const displayNum = sequenceNumber.toString().padStart(2, "0");

    if (order.orderType === "bungkus") {
      titleId = `Bungkus #${displayNum}`;
    } else {
      titleId = order.diningTableId
        ? `Meja ${order.diningTableId} - Item #${displayNum}`
        : `Order #${displayNum}`;
    }

    return {
      id: titleId,
      date,
      totalPrice: order.totalPrice,
      orderType: order.orderType,
      items: order.items.map((item) => ({
        n: item.stock.name,
        q: item.quantity,
        isTakeaway: item.isTakeaway === "true",
      })),
    };
  });
}
