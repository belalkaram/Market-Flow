import type { Request, Response } from "express";
import app from "./app";

/**
 * Vercel Serverless Function Handler
 * Normalizes URL prefix and delegates execution to Express app.
 */
export default function handler(req: Request, res: Response) {
  if (req.url && !req.url.startsWith("/api")) {
    const url = req.url.startsWith("/") ? req.url : `/${req.url}`;
    req.url = `/api${url}`;
  }
  return app(req, res);
}

export { app };
