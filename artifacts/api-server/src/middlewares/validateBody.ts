import { RequestHandler } from "express";
import { ZodSchema } from "zod";
import { AppError } from "./errorHandler";

export const validateBody = (schema: ZodSchema): RequestHandler => {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err: any) {
      const message = err?.errors ? err.errors.map((e: any) => e.message).join(", ") : err.message || "Invalid request body";
      next(new AppError(400, message));
    }
  };
};

export default validateBody;
