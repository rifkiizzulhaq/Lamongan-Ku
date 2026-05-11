"use server";

import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getHistory(page: number = 1, limitNum: number = 5) {
  const result = await db.query.orders.findMany({
    where: eq(orders.status, "selesai"),
    with: {
      items: {
        with: {
          stock: true,
        },
      },
      diningTable: true,
    },
    orderBy: [desc(orders.createdAt)],
    limit: limitNum,
    offset: (page - 1) * limitNum,
  });

  return result.map((order) => {
    const date = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
      .format(order.createdAt)
      .replace(/\./g, ":");

    let titleId = "";
    if (order.orderType === "bungkus") {
      titleId = `Bungkus #${order.id.toString().padStart(2, "0")}`;
    } else {
      titleId = order.diningTable
        ? `${order.diningTable.name.replace("meja-", "Meja ")} - Item #${order.id.toString().padStart(2, "0")}`
        : `Order #${order.id.toString().padStart(2, "0")}`;
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
