import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq, like, and, isNull, sql, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { tenants, users, branches, roles } from "@workspace/db/schema";
import { requireSuperAdmin } from "../../middlewares/platformAuth";
import { AppError } from "../../middlewares/errorHandler";
import { success } from "../../utils/response";
import { addDays } from "../../utils/dateUtils";

const router = Router();
router.use(requireSuperAdmin);

const createStoreSchema = z.object({
  storeName: z.string().min(2, "اسم المتجر مطلوب"),
  ownerName: z.string().min(2, "اسم المالك مطلوب"),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  phone: z.string().optional(),
  password: z.string().min(8).optional().default("MarketFlow@2025"),
});

router.get("/", async (req, res, next) => {
  try {
    const { search, status, limit = "50" } = req.query as Record<string, string>;
    const storeList = await db.select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      status: tenants.status,
      subscriptionStatus: tenants.subscriptionStatus,
      trialStartsAt: tenants.trialStartsAt,
      trialEndsAt: tenants.trialEndsAt,
      createdAt: tenants.createdAt,
      ownerUserId: tenants.ownerUserId,
    }).from(tenants)
      .where(and(
        isNull(tenants.deletedAt),
        status ? eq(tenants.status, status) : undefined,
        search ? like(tenants.name, `%${search}%`) : undefined,
      ))
      .orderBy(desc(tenants.createdAt))
      .limit(parseInt(limit));

    const enriched = await Promise.all(storeList.map(async store => {
      if (!store.ownerUserId) return { ...store, ownerName: null, ownerEmail: null };
      const owner = await db.select({ name: users.name, email: users.email })
        .from(users).where(eq(users.id, store.ownerUserId)).limit(1);
      return { ...store, ownerName: owner[0]?.name, ownerEmail: owner[0]?.email };
    }));

    success(res, enriched);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const store = await db.select().from(tenants).where(eq(tenants.id, req.params.id)).limit(1);
    if (!store.length) throw new AppError(404, "المتجر غير موجود");

    let owner = null;
    if (store[0].ownerUserId) {
      const u = await db.select({ name: users.name, email: users.email, phone: users.phone })
        .from(users).where(eq(users.id, store[0].ownerUserId)).limit(1);
      owner = u[0] || null;
    }

    const [userCount] = await db.select({ count: sql<number>`count(*)` })
      .from(users).where(and(eq(users.tenantId, req.params.id), isNull(users.deletedAt)));

    success(res, { ...store[0], owner, usersCount: Number(userCount.count) });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = createStoreSchema.safeParse(req.body);
    if (!body.success) throw new AppError(422, "بيانات غير صحيحة", body.error.flatten().fieldErrors);

    const { storeName, ownerName, email, phone, password } = body.data;
    const slug = storeName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();
    const trialEndsAt = addDays(new Date(), 10);

    const [store] = await db.insert(tenants).values({
      name: storeName,
      slug,
      status: "trial",
      subscriptionStatus: "trial",
      trialStartsAt: new Date(),
      trialEndsAt,
      trialDays: 10,
    }).returning();

    const [mainBranch] = await db.insert(branches).values({
      tenantId: store.id,
      name: "الفرع الرئيسي",
    }).returning();

    const [ownerRole] = await db.insert(roles).values({
      tenantId: store.id,
      name: "مالك",
      slug: "owner",
      description: "صلاحيات كاملة",
      isSystem: true,
    }).returning();

    const hash = await bcrypt.hash(password!, 10);
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

    await db.update(tenants).set({ ownerUserId: owner.id }).where(eq(tenants.id, store.id));

    success(res, { store: { ...store, ownerUserId: owner.id }, owner: { id: owner.id, name: owner.name, email: owner.email } });
  } catch (err) {
    next(err);
  }
});

async function doStoreAction(id: string, action: string, body: any, adminId: string): Promise<void> {
  const store = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  if (!store.length) throw new AppError(404, "المتجر غير موجود");

  switch (action) {
    case "activate":
      await db.update(tenants).set({ status: "active", subscriptionStatus: "active", updatedAt: new Date() }).where(eq(tenants.id, id));
      break;
    case "deactivate":
      await db.update(tenants).set({ status: "deactivated", updatedAt: new Date() }).where(eq(tenants.id, id));
      break;
    case "suspend":
      await db.update(tenants).set({ status: "suspended", updatedAt: new Date() }).where(eq(tenants.id, id));
      break;
    case "restore":
      await db.update(tenants).set({ status: "trial", deletedAt: null, updatedAt: new Date() }).where(eq(tenants.id, id));
      break;
    case "delete":
      await db.update(tenants).set({ status: "deleted", deletedAt: new Date(), updatedAt: new Date() }).where(eq(tenants.id, id));
      break;
    case "trial/extend": {
      const days = Number(body?.days);
      if (!days || days < 1) throw new AppError(422, "يرجى تحديد عدد الأيام");
      const current = store[0].trialEndsAt ?? new Date();
      await db.update(tenants).set({
        trialEndsAt: addDays(current, days),
        updatedAt: new Date(),
      }).where(eq(tenants.id, id));
      break;
    }
    case "trial/reduce": {
      const days = Number(body?.days);
      if (!days || days < 1) throw new AppError(422, "يرجى تحديد عدد الأيام");
      const current = store[0].trialEndsAt ?? new Date();
      await db.update(tenants).set({
        trialEndsAt: addDays(current, -days),
        updatedAt: new Date(),
      }).where(eq(tenants.id, id));
      break;
    }
    case "trial/end":
      await db.update(tenants).set({ trialEndsAt: new Date(), updatedAt: new Date() }).where(eq(tenants.id, id));
      break;
    case "trial/reset":
      await db.update(tenants).set({
        trialStartsAt: new Date(),
        trialEndsAt: addDays(new Date(), 10),
        status: "trial",
        subscriptionStatus: "trial",
        updatedAt: new Date(),
      }).where(eq(tenants.id, id));
      break;
    default:
      throw new AppError(400, "إجراء غير معروف");
  }
}

for (const action of ["activate", "deactivate", "suspend", "restore", "delete"]) {
  router.post(`/:id/${action}`, async (req, res, next) => {
    try {
      await doStoreAction(req.params.id, action, req.body, (req as any).platformAdmin.id);
      success(res, { message: "تمت العملية بنجاح" });
    } catch (err) {
      next(err);
    }
  });
}

for (const sub of ["extend", "reduce", "end", "reset"]) {
  router.post(`/:id/trial/${sub}`, async (req, res, next) => {
    try {
      await doStoreAction(req.params.id, `trial/${sub}`, req.body, (req as any).platformAdmin.id);
      success(res, { message: "تمت العملية بنجاح" });
    } catch (err) {
      next(err);
    }
  });
}

export default router;
