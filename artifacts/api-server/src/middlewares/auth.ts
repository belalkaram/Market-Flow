import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import { AppError } from "./errorHandler";

export interface JwtPayload {
  userId: string;
  tenantId: string;
  branchId?: string;
  roleSlug: string;
  roleName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "غير مصرح بالدخول، يرجى تسجيل الدخول أولاً"));
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً"));
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "غير مصرح بالدخول"));
    if (!roles.includes(req.user.roleSlug)) {
      return next(new AppError(403, "ليس لديك صلاحية لهذا الإجراء"));
    }
    next();
  };
}
