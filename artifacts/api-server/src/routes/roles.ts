import { Router } from "express";
import { eq, and, count } from "drizzle-orm";
import { db } from "@workspace/db";
import { roles, permissions, rolePermissions, users } from "@workspace/db/schema";
import { requireAuth, requireRole } from "../middlewares/auth";
import { success } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";

const router = Router();
router.use(requireAuth);
router.use(requireRole("owner", "admin"));

router.get("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const roleRows = await db.select().from(roles).where(eq(roles.tenantId, tenantId));

    const rolesWithCount = await Promise.all(
      roleRows.map(async (role) => {
        const [uc] = await db.select({ count: count() }).from(users)
          .where(and(eq(users.roleId, role.id), eq(users.tenantId, tenantId), eq(users.isActive, true)));
        return { ...role, userCount: uc?.count ?? 0 };
      })
    );

    success(res, rolesWithCount);
  } catch (err) { next(err); }
});

router.get("/:id/permissions", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const [role] = await db.select().from(roles)
      .where(and(eq(roles.id, req.params.id), eq(roles.tenantId, tenantId)));
    if (!role) throw new AppError(404, "الدور غير موجود");

    const allPerms = await db.select().from(permissions);
    const rolePerms = await db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, req.params.id));

    const grantedIds = new Set(rolePerms.map(p => p.permissionId));

    success(res, {
      role,
      permissions: allPerms.map(p => ({ ...p, granted: grantedIds.has(p.id) })),
    });
  } catch (err) { next(err); }
});

router.put("/:id/permissions", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const { permissionIds } = req.body as { permissionIds: string[] };

    const [role] = await db.select().from(roles)
      .where(and(eq(roles.id, req.params.id), eq(roles.tenantId, tenantId)));
    if (!role) throw new AppError(404, "الدور غير موجود");
    if (role.slug === "owner" || role.slug === "admin") {
      throw new AppError(403, "لا يمكن تعديل صلاحيات هذا الدور");
    }

    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, req.params.id));

    if (permissionIds?.length > 0) {
      await db.insert(rolePermissions)
        .values(permissionIds.map(permissionId => ({ roleId: req.params.id, permissionId })))
        .onConflictDoNothing();
    }

    success(res, { message: "تم تحديث الصلاحيات بنجاح" });
  } catch (err) { next(err); }
});

export default router;
