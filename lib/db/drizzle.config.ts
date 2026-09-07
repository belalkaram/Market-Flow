import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env and local .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const targetRaw = (process.env.DB_TARGET || "neon").toLowerCase().trim();
const target = targetRaw === "vps" ? "vps" : "neon";

const url = target === "vps"
  ? (process.env.VPS_DATABASE_URL || process.env.DATABASE_URL)
  : (process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);

if (!url) {
  throw new Error(
    `Database connection string not found for target [${target}]. ` +
    `Set ${target === "vps" ? "VPS_DATABASE_URL" : "NEON_DATABASE_URL"} or DATABASE_URL.`
  );
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url },
});


