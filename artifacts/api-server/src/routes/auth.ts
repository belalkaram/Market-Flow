import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { users, permissions, rolePermissions } from "@workspace/db/schema";
import { loginUser, getCurrentUser } from "../services/auth.service";
import { requireAuth } from "../middlewares/auth";
import { success } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";
import { loginRateLimiter } from "../middlewares/rateLimit";
import { logActivity, logSecurity } from "../services/security.service";
import { getMaintenanceStatus } from "../utils/maintenance";

const router = Router();

const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صحيح").toLowerCase().trim(),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

router.post("/login", loginRateLimiter, async (req, res, next) => {
  try {
    const maintenance = getMaintenanceStatus();
    if (maintenance.enabled) {
      res.status(503).json({ success: false, message: maintenance.message, code: "MAINTENANCE" });
      return;
    }

    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(422, "بيانات غير صحيحة", body.error.flatten().fieldErrors);
    }
    const ip = req.ip ?? req.socket.remoteAddress;
    const ua = req.headers["user-agent"];
    const result = await loginUser(body.data.email, body.data.password, ip, ua);
    await logActivity({
      tenantId: result.user.tenantId,
      userId: result.user.id,
      userName: result.user.name,
      action: "login",
      page: "auth",
      details: `تسجيل دخول ناجح`,
      ipAddress: ip,
    });
    success(res, result);
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user!.userId);
    success(res, user);
  } catch (err) {
    next(err);
  }
});

router.get("/permissions", requireAuth, async (req, res, next) => {
  try {
    const { userId, roleSlug } = req.user!;

    if (roleSlug === "owner" || roleSlug === "admin") {
      const allPerms = await db.select({ resource: permissions.resource, action: permissions.action }).from(permissions);
      return success(res, allPerms);
    }

    const [user] = await db.select({ roleId: users.roleId }).from(users).where(eq(users.id, userId));
    if (!user?.roleId) return success(res, []);

    const perms = await db
      .select({ resource: permissions.resource, action: permissions.action })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, user.roleId));

    return success(res, perms);
  } catch (err) {
    return next(err);
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  await logActivity({
    tenantId: req.user!.tenantId,
    branchId: req.user!.branchId,
    userId: req.user!.userId,
    action: "logout",
    page: "auth",
    details: "تسجيل خروج",
    ipAddress: req.ip ?? req.socket.remoteAddress,
  });
  await logSecurity({ event: "logout", severity: "low", userId: req.user!.userId, tenantId: req.user!.tenantId, ipAddress: req.ip ?? req.socket.remoteAddress });
  success(res, { message: "تم تسجيل الخروج بنجاح" });
});

export default router;
