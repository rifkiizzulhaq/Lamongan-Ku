"use server";

import { db } from "@/db";
import { dining_table } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { z } from "zod";

const createTableSchema = z.object({
  name: z.string().min(1),
});

const updateTableSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
});

export async function getAllTables() {
  try {
    await requireAuth(["bos"]);
    return await db.select().from(dining_table).orderBy(dining_table.createdAt);
  } catch (error) {
    console.error("Error fetching tables:", error);
    return [];
  }
}

export async function createTable(name: string) {
  try {
    await requireAuth(["bos"]);
    const parsed = createTableSchema.parse({ name: name.trim() });

    if (!parsed.name)
      return { success: false, error: "Nama meja tidak boleh kosong" };

    await db.insert(dining_table).values({ name: parsed.name });
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    console.error("Error creating table:", error);
    return { success: false, error: "Gagal membuat meja" };
  }
}

export async function updateTable(id: number, name: string) {
  try {
    await requireAuth(["bos"]);
    const parsed = updateTableSchema.parse({ id, name: name.trim() });

    if (!parsed.name)
      return { success: false, error: "Nama meja tidak boleh kosong" };

    await db
      .update(dining_table)
      .set({ name: parsed.name })
      .where(eq(dining_table.id, parsed.id));
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    console.error("Error updating table:", error);
    return { success: false, error: "Gagal memperbarui meja" };
  }
}

export async function deleteTable(id: number) {
  try {
    await requireAuth(["bos"]);
    await db.delete(dining_table).where(eq(dining_table.id, id));
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    console.error("Error deleting table:", error);
    return { success: false, error: "Gagal menghapus meja" };
  }
}
