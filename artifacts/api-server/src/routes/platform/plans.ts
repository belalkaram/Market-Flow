import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { subscriptionPlans } from "@workspace/db/schema";
import { requireSuperAdmin } from "../../middlewares/platformAuth";
import { AppError } from "../../middlewares/errorHandler";
import { success } from "../../utils/response";

const router = Router();
router.use(requireSuperAdmin);

const planSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceMonthly: z.string().or(z.number()),
  priceYearly: z.string().or(z.number()),
  currency: z.string().optional().default("KWD"),
  maxUsers: z.string().or(z.number()).transform(Number),
  maxBranches: z.string().or(z.number()).transform(Number),
  maxProducts: z.string().or(z.number()).transform(Number),
  isActive: z.boolean().optional().default(true),
});

router.get("/", async (_req, res, next) => {
  try {
    const plans = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
    success(res, plans);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = planSchema.safeParse(req.body);
    if (!body.success) throw new AppError(422, "بيانات غير صحيحة", body.error.flatten().fieldErrors);
    const [plan] = await db.insert(subscriptionPlans).values({
      name: body.data.name,
      description: body.data.description,
      priceMonthly: String(body.data.priceMonthly),
      priceYearly: String(body.data.priceYearly),
      currency: body.data.currency,
      maxUsers: body.data.maxUsers,
      maxBranches: body.data.maxBranches,
      maxProducts: body.data.maxProducts,
    }).returning();
    success(res, plan);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const body = planSchema.partial().safeParse(req.body);
    if (!body.success) throw new AppError(422, "بيانات غير صحيحة");
    const update: any = { updatedAt: new Date() };
    if (body.data.name !== undefined) update.name = body.data.name;
    if (body.data.description !== undefined) update.description = body.data.description;
    if (body.data.priceMonthly !== undefined) update.priceMonthly = String(body.data.priceMonthly);
    if (body.data.priceYearly !== undefined) update.priceYearly = String(body.data.priceYearly);
    if (body.data.maxUsers !== undefined) update.maxUsers = body.data.maxUsers;
    if (body.data.maxBranches !== undefined) update.maxBranches = body.data.maxBranches;
    if (body.data.maxProducts !== undefined) update.maxProducts = body.data.maxProducts;
    if (body.data.isActive !== undefined) update.isActive = body.data.isActive;
    const [plan] = await db.update(subscriptionPlans).set(update).where(eq(subscriptionPlans.id, req.params.id)).returning();
    if (!plan) throw new AppError(404, "الخطة غير موجودة");
    success(res, plan);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, req.params.id));
    success(res, { message: "تم حذف الخطة" });
  } catch (err) {
    next(err);
  }
});

export default router;
