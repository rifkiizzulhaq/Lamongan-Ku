import "dotenv/config";
import { auth } from "../lib/auth";
import { db } from "./index";
import { user } from "./auth-schema";
import { stock, dining_table } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const defaultUsers = [
    {
      name: "Bos",
      email: "ayah@lamonganku.id",
      password: "Ayahes1234",
      role: "bos",
    },
    {
      name: "Karyawan",
      email: "karyawan@lamonganku.id",
      password: "karyawan@1234",
      role: "karyawan",
    },
  ];

  for (const u of defaultUsers) {
    try {
      await auth.api.signUpEmail({
        body: {
          email: u.email,
          password: u.password,
          name: u.name,
        },
      });

      await db
        .update(user)
        .set({ role: u.role })
        .where(eq(user.email, u.email));

      console.log(`Berhasil! User ${u.role} => ${u.email} : ${u.password}`);
    } catch (error) {
      console.log(`${error} Gagal/Sudah ada untuk: ${u.email}. Lanjut...`);
    }
  }

  const menus: (typeof stock.$inferInsert)[] = [
    { name: "Lele", price: 15000 },
    { name: "Ayam Paha", price: 18000 },
    { name: "Ayam Dada", price: 18000 },
    { name: "Bebek Paha", price: 25000 },
    { name: "Bebek Dada", price: 25000 },
    { name: "Nasi", price: 5000 },
    { name: "Tahu", price: 2000 },
    { name: "Tempe", price: 2000 },
    { name: "Ampela Ati", price: 5000 },
    { name: "Kepala Ayam", price: 3000 },
    { name: "Kepala Bebek", price: 5000 },
    { name: "Teh Manis", price: 5000 },
    { name: "Sambal", price: 2000 },
  ];

  for (const menu of menus) {
    await db.insert(stock).values(menu);
  }
  console.log(`Berhasil! Menambahkan ${menus.length} menu stok.`);

  const tables = [
    { name: "Meja 1" },
    { name: "Meja 2" },
    { name: "Meja 3" },
    { name: "Meja 4" },
    { name: "Meja 5" },
    { name: "Meja 6" },
  ];

  for (const table of tables) {
    await db.insert(dining_table).values(table);
  }
  console.log(`Berhasil! Menambahkan ${tables.length} meja makan.`);

  console.log("Seeding selesai.");
  process.exit(0);
}

seed();
