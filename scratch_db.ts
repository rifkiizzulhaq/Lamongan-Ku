import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./db";
import { stock } from "./db/schema";

async function main() {
  console.log("=== STOCK TABLE ===");
  const stocks = await db.select().from(stock);
  console.log(stocks);
}

main().catch(console.error).finally(() => process.exit(0));
