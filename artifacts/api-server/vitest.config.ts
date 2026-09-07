import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

process.env.JWT_SECRET = process.env.JWT_SECRET || "marketflow-test-jwt-secret-2026";
process.env.PORT = process.env.PORT || "8080";
process.env.NODE_ENV = "test";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 20000,
    hookTimeout: 20000,
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
