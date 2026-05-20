import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./db";
import { daily_stock_snapshots } from "./db/schema";
import { gt } from "drizzle-orm";

async function main() {
  console.log("=== NON-ZERO SNAPSHOTS ===");
  const snaps = await db.select().from(daily_stock_snapshots).where(gt(daily_stock_snapshots.sisaQuantity, 0));
  console.log(snaps);
}

main().catch(console.error).finally(() => process.exit(0));
