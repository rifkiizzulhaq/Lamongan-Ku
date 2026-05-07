import "dotenv/config";
import postgres from "postgres";

async function resetData() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL tidak ditemukan di .env.local");
  }

  const sql = postgres(connectionString, { prepare: false });

  try {
    const tables = [
      "order_items",
      "orders",
      "daily_stock_snapshots",
      "weather_logs",
      "daily_reports",
      "stock",
      "account",
      "session",
      "verification",
      "user",
    ];

    const rows = await sql<{ tablename: string }[]>`
      select tablename
      from pg_tables
      where schemaname = 'public'
        and tablename = any(${tables})
    `;

    const existingTables = rows.map((row) => row.tablename);

    if (existingTables.length > 0) {
      const quotedTables = existingTables
        .map((tableName) => `"${tableName.replace(/"/g, '\\"')}"`)
        .join(", ");

      await sql.unsafe(
        `truncate table ${quotedTables} restart identity cascade`,
      );
    }

    console.log("Reset selesai. Tabel dihapus:", existingTables);
  } finally {
    await sql.end();
  }
}

resetData().catch((error) => {
  console.error("Gagal reset data:", error);
  process.exit(1);
});
