import app from "./app";
import { logger } from "./lib/logger";
import { AppError } from "./middlewares/errorHandler";

// Environment validation
if (!process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL && !process.env.VPS_DATABASE_URL) {
  throw new Error("DATABASE_URL, NEON_DATABASE_URL, or VPS_DATABASE_URL is required");
}
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
