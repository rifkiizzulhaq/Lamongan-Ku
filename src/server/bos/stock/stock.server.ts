"use server";

import { db } from "@/db";
import { stock } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { z } from "zod";

const createStockSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().min(0),
});

const updateStockSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  price: z.number().int().min(0),
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

export async function create(name: string, price: number) {
  try {
    await requireAuth(["bos"]);
    const parsed = createStockSchema.parse({
      name,
      price,
    });
    await db.insert(stock).values({
      name: parsed.name,
      price: parsed.price,
    });
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    console.error("Error in stock operation:", error);
    return { success: false };
  }
}

export async function update(id: number, name: string, price: number) {
  try {
    await requireAuth(["bos"]);
    const parsed = updateStockSchema.parse({ id, name, price });
    await db
      .update(stock)
      .set({
        name: parsed.name,
        price: parsed.price,
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
