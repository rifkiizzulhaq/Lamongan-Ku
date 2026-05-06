import "dotenv/config";
import { auth } from "../lib/auth";
import { db } from "./index";
import { user } from "./auth-schema";
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

  console.log("Seeding selesai.");
  process.exit(0);
}

seed();
