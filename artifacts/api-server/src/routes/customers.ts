import { Router } from "express";
import { eq, and, isNull, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { customers, salesOrders, insertCustomerSchema } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const rows = await db.select().from(customers).where(and(eq(customers.tenantId, req.user!.tenantId), eq(customers.isActive, true), isNull(customers.deletedAt)));
    success(res, rows);
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [row] = await db.select().from(customers).where(and(eq(customers.id, req.params.id), eq(customers.tenantId, req.user!.tenantId)));
    if (!row) throw new AppError(404, "العميل غير موجود");
    const orders = await db.select().from(salesOrders).where(eq(salesOrders.customerId, req.params.id)).orderBy(desc(salesOrders.createdAt)).limit(10);
    success(res, { ...row, recentOrders: orders });
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = insertCustomerSchema.safeParse({ ...req.body, tenantId: req.user!.tenantId });
    if (!parsed.success) throw new AppError(422, "بيانات غير صحيحة", parsed.error.flatten().fieldErrors);
    const [row] = await db.insert(customers).values(parsed.data).returning();
    created(res, row);
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const [row] = await db.update(customers).set({ ...req.body, updatedAt: new Date() }).where(and(eq(customers.id, req.params.id), eq(customers.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "العميل غير موجود");
    success(res, row);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [row] = await db.update(customers).set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() }).where(and(eq(customers.id, req.params.id), eq(customers.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "العميل غير موجود");
    success(res, { message: "تم حذف العميل بنجاح" });
  } catch (err) { next(err); }
});

export default router;
