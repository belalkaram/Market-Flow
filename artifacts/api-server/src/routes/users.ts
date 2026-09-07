import { Router } from "express";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@workspace/db";
import { users, roles, branches } from "@workspace/db/schema";
import { requireAuth, requireRole } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";
import bcrypt from "bcryptjs";
import { z } from "zod";

const router = Router();
router.use(requireAuth);
router.use(requireRole("owner", "admin"));

router.get("/", async (req, res, next) => {
  try {
    const rows = await db
      .select({ user: users, roleName: roles.name, roleSlug: roles.slug, branchName: branches.name })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(branches, eq(users.branchId, branches.id))
      .where(and(eq(users.tenantId, req.user!.tenantId), eq(users.isActive, true), isNull(users.deletedAt)));
    success(res, rows.map(r => {
      const { passwordHash, ...u } = r.user;
      return { ...u, roleName: r.roleName, roleSlug: r.roleSlug, branchName: r.branchName };
    }));
  } catch (err) { next(err); }
});

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  roleId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, "بيانات غير صحيحة", parsed.error.flatten().fieldErrors);
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const [row] = await db.insert(users).values({ ...parsed.data, passwordHash, tenantId: req.user!.tenantId }).returning();
    const { passwordHash: _, ...safeUser } = row;
    created(res, safeUser);
  } catch (err) { next(err); }
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().max(20).optional(),
  avatar: z.string().optional(),
  roleId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

router.put("/:id", async (req, res, next) => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(422, "بيانات غير صحيحة", parsed.error.flatten().fieldErrors);

    // Mass assignment protection — never allow changing tenantId, email, or security fields
    const { password, ...safeFields } = parsed.data;
    const updateData: Record<string, unknown> = { ...safeFields, updatedAt: new Date() };
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

    const [row] = await db.update(users).set(updateData).where(and(eq(users.id, req.params.id), eq(users.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "المستخدم غير موجود");
    const { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___, ...safeUser } = row;
    success(res, safeUser);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [row] = await db.update(users).set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() }).where(and(eq(users.id, req.params.id), eq(users.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "المستخدم غير موجود");
    success(res, { message: "تم حذف المستخدم بنجاح" });
  } catch (err) { next(err); }
});

export default router;
