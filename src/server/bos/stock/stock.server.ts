"use server";

import { db } from "@/db";
import { stock, daily_reports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { z } from "zod";

const updateQuantitiesSchema = z.array(
  z.object({
    stockId: z.number().int().positive(),
    quantity: z.number().int().min(0),
  }),
);

const createStockSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().min(0),
  quantity: z.number().int().min(0),
  isUnlimited: z.boolean().default(false),
});

const updateStockSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  price: z.number().int().min(0),
  isUnlimited: z.boolean().default(false),
});

export async function getAll() {
  try {
    await requireAuth(["bos"]);
    return await db.select().from(stock).orderBy(stock.createdAt);
  } catch (error) {
    console.error("Error fetching stock:", error);
    return [];
  }
}

export async function getYesterdaySnapshot(): Promise<Record<number, number>> {
  try {
    await requireAuth(["bos"]);
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
  } catch (error) {
    console.error("Error fetching yesterday snapshot:", error);
    return {};
  }
}

export async function updateQuantities(
  items: { stockId: number; quantity: number }[],
) {
  try {
    await requireAuth(["bos"]);
    items = updateQuantitiesSchema.parse(items);
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

export async function create(
  name: string,
  price: number,
  quantity: number,
  isUnlimited: boolean = false,
) {
  try {
    await requireAuth(["bos"]);
    const parsed = createStockSchema.parse({
      name,
      price,
      quantity,
      isUnlimited,
    });
    await db.insert(stock).values({
      name: parsed.name,
      price: parsed.price,
      quantity: parsed.quantity,
      isUnlimited: parsed.isUnlimited ? 1 : 0,
    });
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    console.error("Error in stock operation:", error);
    return { success: false };
  }
}

export async function update(
  id: number,
  name: string,
  price: number,
  isUnlimited: boolean = false,
) {
  try {
    await requireAuth(["bos"]);
    const parsed = updateStockSchema.parse({ id, name, price, isUnlimited });
    await db
      .update(stock)
      .set({
        name: parsed.name,
        price: parsed.price,
        isUnlimited: parsed.isUnlimited ? 1 : 0,
      })
      .where(eq(stock.id, parsed.id));
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    console.error("Error in stock operation:", error);
    return { success: false };
  }
}

export async function deletes(id: number) {
  try {
    await requireAuth(["bos"]);
    await db.delete(stock).where(eq(stock.id, id));
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    console.error("Error in stock operation:", error);
    return { success: false };
  }
}
