import { Router } from "express";
import { eq, and, isNull, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { products, stockMovements, inventoryAdjustments, categories, insertInventoryAdjustmentSchema } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth";
import { validateBody } from "../middlewares/validateBody";
import { inventoryAdjustmentSchema } from "../schemas/purchaseSchemas";
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

router.post("/adjustments", validateBody(inventoryAdjustmentSchema), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = { ...req.body, tenantId, createdBy: req.user!.userId } as any;
    // sanitize reason
    const { sanitizeText } = await import("../utils/sanitizer");
    data.reason = sanitizeText(data.reason || "");

    const result = await db.transaction(async (tx) => {
      const [prod] = await tx.select().from(products).where(and(eq(products.id, data.productId), eq(products.tenantId, tenantId)));
      if (!prod) throw new AppError(404, "المنتج غير موجود");

      const quantityBefore = prod.currentStock;
      const quantityAfter = quantityBefore + data.adjustment;

      const [updatedProd] = await tx.update(products).set({ currentStock: quantityAfter, updatedAt: new Date() }).where(and(eq(products.id, data.productId), eq(products.tenantId, tenantId))).returning();
      if (!updatedProd) throw new AppError(500, "فشل تحديث المخزون");

      const [adj] = await tx.insert(inventoryAdjustments).values(data).returning();

      await tx.insert(stockMovements).values({
        tenantId,
        branchId: data.branchId,
        productId: data.productId,
        type: "adjustment",
        quantityBefore,
        quantityChange: data.adjustment,
        quantityAfter,
        referenceType: "adjustment",
        referenceId: adj.id,
        notes: data.reason,
        createdBy: req.user!.userId,
      });

      return adj;
    });

    created(res, result);
  } catch (err) { next(err); }
});

export default router;
