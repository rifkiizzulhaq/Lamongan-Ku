"use server";

import { db } from "@/db";
import { stock, daily_reports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAll() {
  try {
    return await db.select().from(stock).orderBy(stock.createdAt);
  } catch {
    return [];
  }
}

export async function getYesterdaySnapshot(): Promise<Record<number, number>> {
  try {
    const latestReport = await db.query.daily_reports.findFirst({
      orderBy: [desc(daily_reports.createdAt)],
      with: { snapshots: true },
    });

    if (!latestReport) return {};

    const map: Record<number, number> = {};
    latestReport.snapshots.forEach((s) => {
      map[s.stockId] = s.sisaQuantity;
    });
    return map;
  } catch {
    return {};
  }
}

export async function updateQuantities(
  items: { stockId: number; quantity: number }[],
) {
  try {
    await Promise.all(
      items.map((item) =>
        db
          .update(stock)
          .set({ quantity: item.quantity, updatedAt: new Date() })
          .where(eq(stock.id, item.stockId)),
      ),
    );
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    console.error("Error updating stock quantities:", error);
    return { success: false };
  }
}

export async function create(name: string, price: number, quantity: number) {
  try {
    await db.insert(stock).values({ name, price, quantity });
    revalidatePath("/stock");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function update(id: number, name: string, price: number) {
  try {
    await db.update(stock).set({ name, price }).where(eq(stock.id, id));
    revalidatePath("/stock");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deletes(id: number) {
  try {
    await db.delete(stock).where(eq(stock.id, id));
    revalidatePath("/stock");
    return { success: true };
  } catch {
    return { success: false };
  }
}
