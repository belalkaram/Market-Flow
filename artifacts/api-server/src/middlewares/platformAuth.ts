import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { platformAdmins } from "@workspace/db/schema";
import { JWT_SECRET } from "../config/jwt";
import { AppError } from "./errorHandler";

export async function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError(401, "غير مصرح بالدخول"));
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.type !== "platform_admin") {
      return next(new AppError(403, "هذه المنطقة للمشرفين فقط"));
    }
    const admins = await db.select().from(platformAdmins)
      .where(eq(platformAdmins.id, payload.adminId))
      .limit(1);
    if (!admins.length || admins[0].status !== "active") {
      return next(new AppError(401, "الحساب غير مصرح"));
    }
    (req as any).platformAdmin = admins[0];
    next();
  } catch {
    next(new AppError(401, "انتهت صلاحية الجلسة"));
  }
}
