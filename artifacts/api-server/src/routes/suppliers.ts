import { Router } from "express";
import { eq, and, isNull, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { suppliers, purchaseOrders, purchaseOrderItems, products, insertSupplierSchema, insertPurchaseOrderSchema } from "@workspace/db/schema";
import { requireAuth, requireRole } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const rows = await db.select().from(suppliers).where(and(eq(suppliers.tenantId, req.user!.tenantId), eq(suppliers.isActive, true), isNull(suppliers.deletedAt)));
    success(res, rows);
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [row] = await db.select().from(suppliers).where(and(eq(suppliers.id, req.params.id), eq(suppliers.tenantId, req.user!.tenantId)));
    if (!row) throw new AppError(404, "المورد غير موجود");
    const orders = await db.select().from(purchaseOrders).where(and(eq(purchaseOrders.tenantId, req.user!.tenantId), eq(purchaseOrders.supplierId, req.params.id))).orderBy(desc(purchaseOrders.createdAt)).limit(10);
    success(res, { ...row, recentOrders: orders });
  } catch (err) { next(err); }
});

router.post("/", requireRole("owner", "admin", "purchasing_officer"), async (req, res, next) => {
  try {
    const parsed = insertSupplierSchema.safeParse({ ...req.body, tenantId: req.user!.tenantId });
    if (!parsed.success) throw new AppError(422, "بيانات غير صحيحة", parsed.error.flatten().fieldErrors);
    const [row] = await db.insert(suppliers).values(parsed.data).returning();
    created(res, row);
  } catch (err) { next(err); }
});

router.put("/:id", requireRole("owner", "admin", "purchasing_officer"), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const [row] = await db.update(suppliers).set({ ...req.body, updatedAt: new Date() }).where(and(eq(suppliers.id, id), eq(suppliers.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "المورد غير موجود");
    success(res, row);
  } catch (err) { next(err); }
});

router.delete("/:id", requireRole("owner", "admin", "purchasing_officer"), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const [row] = await db.update(suppliers).set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() }).where(and(eq(suppliers.id, id), eq(suppliers.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "المورد غير موجود");
    success(res, { message: "تم حذف المورد بنجاح" });
  } catch (err) { next(err); }
});

export default router;
