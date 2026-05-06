import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: ["./db/schema.ts", "./db/auth-schema.ts"],
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!, 
  },
});
