import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { users, permissions, rolePermissions } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { AppError } from "./errorHandler";
import { logSecurity } from "../services/security.service";

const OWNER_ADMIN_ROLES = ["owner", "admin"];

export function requirePermission(resource: string, action: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "غير مصرح بالدخول"));

    const { userId, roleSlug, tenantId } = req.user;

    if (OWNER_ADMIN_ROLES.includes(roleSlug)) return next();

    const [userRow] = await db.select({ roleId: users.roleId }).from(users).where(eq(users.id, userId)).limit(1);
    if (!userRow?.roleId) {
      await logSecurity({ event: "permission_denied", severity: "medium", userId, tenantId, metadata: { resource, action } });
      return next(new AppError(403, "ليس لديك صلاحية لهذا الإجراء", undefined, "FORBIDDEN"));
    }

    const [perm] = await db
      .select({ id: permissions.id })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(and(
        eq(rolePermissions.roleId, userRow.roleId),
        eq(permissions.resource, resource),
        eq(permissions.action, action),
      ))
      .limit(1);

    if (!perm) {
      await logSecurity({ event: "permission_denied", severity: "medium", userId, tenantId, ipAddress: req.ip, userAgent: req.headers["user-agent"], metadata: { resource, action, path: req.path } });
      return next(new AppError(403, "ليس لديك صلاحية لهذا الإجراء", undefined, "FORBIDDEN"));
    }

    next();
  };
}
