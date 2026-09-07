import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger";

const isProd = process.env.NODE_ENV === "production";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: unknown,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "بيانات غير صحيحة",
      code: "VALIDATION_ERROR",
      errors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors,
    });
  }

  const logId = `ERR-${Date.now()}`;
  logger.error({ err, logId, path: req.path, method: req.method }, "Unhandled error");

  return res.status(500).json({
    success: false,
    message: "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً",
    code: "INTERNAL_ERROR",
    ...(isProd ? {} : { detail: err.message, stack: err.stack }),
  });
}
