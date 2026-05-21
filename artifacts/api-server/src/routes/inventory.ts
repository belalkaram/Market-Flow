import { Router } from "express";
import { eq, and, isNull, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { products, stockMovements, inventoryAdjustments, categories, insertInventoryAdjustmentSchema } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";
import { sql } from "drizzle-orm";

const router = Router();
router.use(requireAuth);

router.get("/stock", async (req, res, next) => {
  try {
    const rows = await db
      .select({ product: products, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.tenantId, req.user!.tenantId), eq(products.isActive, true), isNull(products.deletedAt)));
    success(res, rows.map(r => ({ ...r.product, categoryName: r.categoryName })));
  } catch (err) { next(err); }
});

router.get("/movements", async (req, res, next) => {
  try {
    const rows = await db
      .select({ movement: stockMovements, productName: products.name })
      .from(stockMovements)
      .leftJoin(products, eq(stockMovements.productId, products.id))
      .where(eq(stockMovements.tenantId, req.user!.tenantId))
      .orderBy(desc(stockMovements.createdAt))
      .limit(200);
    success(res, rows.map(r => ({ ...r.movement, productName: r.productName })));
  } catch (err) { next(err); }
});

router.get("/low-stock", async (req, res, next) => {
  try {
    const rows = await db
      .select({ product: products, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(
        eq(products.tenantId, req.user!.tenantId),
        eq(products.isActive, true),
        isNull(products.deletedAt),
        sql`${products.currentStock} <= ${products.minStock}`
      ));
    success(res, rows.map(r => ({ ...r.product, categoryName: r.categoryName })));
  } catch (err) { next(err); }
});

router.post("/adjustments", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const parsed = insertInventoryAdjustmentSchema.safeParse({ ...req.body, tenantId, createdBy: req.user!.userId });
    if (!parsed.success) throw new AppError(422, "بيانات غير صحيحة", parsed.error.flatten().fieldErrors);

    const [prod] = await db.select().from(products).where(and(eq(products.id, parsed.data.productId!), eq(products.tenantId, tenantId)));
    if (!prod) throw new AppError(404, "المنتج غير موجود");

    const quantityBefore = prod.currentStock;
    const quantityAfter = quantityBefore + parsed.data.quantity!;

    await db.update(products).set({ currentStock: quantityAfter, updatedAt: new Date() }).where(eq(products.id, parsed.data.productId!));
    const [adj] = await db.insert(inventoryAdjustments).values(parsed.data).returning();

    await db.insert(stockMovements).values({
      tenantId,
      branchId: parsed.data.branchId,
      productId: parsed.data.productId!,
      type: "adjustment",
      quantityBefore,
      quantityChange: parsed.data.quantity!,
      quantityAfter,
      referenceType: "adjustment",
      referenceId: adj.id,
      notes: parsed.data.reason,
      createdBy: req.user!.userId,
    });

    created(res, adj);
  } catch (err) { next(err); }
});

export default router;
