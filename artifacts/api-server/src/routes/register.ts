import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { tenants, users, branches, roles } from "@workspace/db/schema";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt";
import { AppError } from "../middlewares/errorHandler";
import { success } from "../utils/response";
import { addDays } from "../utils/dateUtils";
import { registerRateLimiter } from "../middlewares/rateLimit";
import { sanitizeString } from "../middlewares/validate";
import { getMaintenanceStatus } from "../utils/maintenance";

const router = Router();

const registerSchema = z.object({
  storeName: z.string().min(2, "اسم المتجر مطلوب").max(100).transform(sanitizeString),
  ownerName: z.string().min(2, "اسم المالك مطلوب").max(100).transform(sanitizeString),
  email: z.string().email("بريد إلكتروني غير صحيح").toLowerCase().trim(),
  phone: z.string().max(20).optional(),
  password: z.string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .regex(/[A-Za-z]/, "كلمة المرور يجب أن تحتوي على حرف واحد على الأقل")
    .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل"),
});

router.post("/", registerRateLimiter, async (req, res, next) => {
  try {
    const maintenance = getMaintenanceStatus();
    if (maintenance.enabled) {
      res.status(503).json({ success: false, message: maintenance.message, code: "MAINTENANCE" });
      return;
    }

    const body = registerSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(422, "بيانات غير صحيحة", body.error.flatten().fieldErrors);
    }

    const { storeName, ownerName, email, phone, password } = body.data;

    // Check email uniqueness
    const existing = await db.select({ id: users.id }).from(users)
      .where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      throw new AppError(409, "البريد الإلكتروني مستخدم بالفعل");
    }

    const slug = storeName.trim().toLowerCase()
      .replace(/[\s\u0600-\u06FF]/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();

    const trialEndsAt = addDays(new Date(), 10);

    // Create store
    const [store] = await db.insert(tenants).values({
      name: storeName,
      slug,
      status: "trial",
      subscriptionStatus: "trial",
      trialStartsAt: new Date(),
      trialEndsAt,
      trialDays: 10,
    }).returning();

    // Create main branch
    const [mainBranch] = await db.insert(branches).values({
      tenantId: store.id,
      name: "الفرع الرئيسي",
    }).returning();

    // Create owner role
    const [ownerRole] = await db.insert(roles).values({
      tenantId: store.id,
      name: "مالك",
      slug: "owner",
      description: "صلاحيات كاملة",
      isSystem: true,
    }).returning();

    // Create owner user
    const hash = await bcrypt.hash(password, 10);
    const [owner] = await db.insert(users).values({
      tenantId: store.id,
      branchId: mainBranch.id,
      roleId: ownerRole.id,
      name: ownerName,
      email,
      phone: phone || null,
      passwordHash: hash,
      isActive: true,
    }).returning();

    // Set ownerUserId on store
    await db.update(tenants).set({ ownerUserId: owner.id }).where(eq(tenants.id, store.id));

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: owner.id,
        tenantId: store.id,
        branchId: mainBranch.id,
        roleSlug: "owner",
        roleName: "مالك",
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    success(res, {
      token,
      user: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: "owner",
        roleName: "مالك",
        tenantId: store.id,
        tenantName: store.name,
      },
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        status: store.status,
        trialEndsAt: store.trialEndsAt,
        trialDays: store.trialDays,
      },
      trialEndsAt: store.trialEndsAt,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
