"use server";

import { db } from "@/db";
import { dining_table } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAllTables() {
  try {
    return await db.select().from(dining_table).orderBy(dining_table.createdAt);
  } catch {
    return [];
  }
}

export async function createTable(name: string) {
  try {
    if (!name.trim())
      return { success: false, error: "Nama meja tidak boleh kosong" };

    await db.insert(dining_table).values({ name: name.trim() });
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    console.error("Error creating table:", error);
    return { success: false, error: "Gagal membuat meja" };
  }
}

export async function updateTable(id: number, name: string) {
  try {
    if (!name.trim())
      return { success: false, error: "Nama meja tidak boleh kosong" };

    await db
      .update(dining_table)
      .set({ name: name.trim() })
      .where(eq(dining_table.id, id));
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    console.error("Error updating table:", error);
    return { success: false, error: "Gagal memperbarui meja" };
  }
}

export async function deleteTable(id: number) {
  try {
    await db.delete(dining_table).where(eq(dining_table.id, id));
    revalidatePath("/stock");
    return { success: true };
  } catch (error) {
    console.error("Error deleting table:", error);
    return { success: false, error: "Gagal menghapus meja" };
  }
}
