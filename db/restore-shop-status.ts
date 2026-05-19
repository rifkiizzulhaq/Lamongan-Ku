import "dotenv/config";
import { db } from "./index";
import { shop_status } from "./schema";
import { eq } from "drizzle-orm";

async function restoreShop() {
  console.log("Menghubungkan ke database untuk mengambil status warung saat ini...");
  
  const current = await db.query.shop_status.findFirst();
  
  if (!current) {
    console.log("Data status warung tidak ditemukan! Membuat data baru dengan status Buka (1)...");
    const [inserted] = await db.insert(shop_status).values({
      isBuka: 1,
      reason: null,
      updatedAt: new Date()
    }).returning();
    console.log("Status warung berhasil dibuat baru:", inserted);
    return;
  }
  
  console.log("Status warung saat ini di database:", {
    id: current.id,
    isBuka: current.isBuka,
    reason: current.reason,
    updatedAt: current.updatedAt
  });
  
  if (current.isBuka === 0) {
    console.log("Status warung saat ini sedang LIBUR (0). Memulihkan status ke BUKA (1)...");
    
    const [updated] = await db
      .update(shop_status)
      .set({
        isBuka: 1,
        reason: null,
        updatedAt: new Date()
      })
      .where(eq(shop_status.id, current.id))
      .returning();
      
    console.log("Status warung BERHASIL dipulihkan ke BUKA (1):", {
      id: updated.id,
      isBuka: updated.isBuka,
      reason: updated.reason,
      updatedAt: updated.updatedAt
    });
  } else {
    console.log("Status warung di database memang sudah BUKA (1) saat ini. Tidak perlu pemulihan.");
  }
}

restoreShop()
  .then(() => {
    console.log("Selesai.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Terjadi error saat memulihkan status warung:", err);
    process.exit(1);
  });
