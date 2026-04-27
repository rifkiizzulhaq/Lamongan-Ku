"use server";

import { db } from "@/db";
import { users, NewUser } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function createUser(formData: NewUser) {
  try {
    const name = formData.name;
    const email = formData.email;

    if (!name || !email) {
      return { success: false, message: "Nama dan email harus diisi!" };
    }

    await db.insert(users).values({
      name,
      email,
    });

    revalidatePath("/");

    return { success: true, message: "User berhasil ditambahkan" };
  } catch (error: unknown) {
    console.error("Gagal menyimpan user:", error);

    if (error instanceof Error && error.message.includes("duplicate key")) {
      return { success: false, message: "Email ini sudah digunakan." };
    }

    return { success: false, message: "Terjadi kesalahan internal server" };
  }
}
