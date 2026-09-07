import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import * as schema from "./schema";

if (!process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL && !process.env.VPS_DATABASE_URL) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
    dotenv.config();
  } catch (e) {
    // ignore if path fails
  }
}

const { Pool } = pg;

export type DbTarget = "neon" | "vps";

export function getConnectionString(): { connectionString: string; target: DbTarget } {
  const targetRaw = (process.env.DB_TARGET || "neon").toLowerCase().trim();
  const target: DbTarget = targetRaw === "vps" ? "vps" : "neon";

  let connectionString: string | undefined;

  if (target === "vps") {
    connectionString = process.env.VPS_DATABASE_URL || process.env.DATABASE_URL;
  } else {
    connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  }

  if (!connectionString) {
    throw new Error(
      `Database connection string not configured for target [${target}]. ` +
      `Please set ${target === "vps" ? "VPS_DATABASE_URL" : "NEON_DATABASE_URL"} or DATABASE_URL in your environment variables.`
    );
  }

  return { connectionString, target };
}

const { connectionString, target } = getConnectionString();

export const activeDbTarget = target;

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("neon.tech") || connectionString.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
});

export const db = drizzle(pool, { schema });

export * from "./schema";

