import { db } from "../../db";
import { users } from "../../db/schema";
import { eq, desc } from "drizzle-orm";


export async function getAllUsers() {
  try {
    const data = await db.select().from(users).orderBy(desc(users.createdAt));
    return data;
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    throw new Error("Terjadi kesalahan saat memuat data user.");
  }
}

export async function getUserById(id: number) {
  try {
    const data = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return data[0] || null;
  } catch (error) {
    console.error("Gagal mengambil detail user:", error);
    throw new Error("Terjadi kesalahan saat memuat detail user.");
  }
}
