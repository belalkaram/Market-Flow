import { Router } from "express";
import { eq, and, isNull, ilike, or } from "drizzle-orm";
import { db } from "@workspace/db";
import { products, categories, insertProductSchema } from "@workspace/db/schema";
import { requireAuth, requireRole } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";
import { sql } from "drizzle-orm";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const { search, categoryId, lowStock } = req.query;

    let conditions = and(eq(products.tenantId, tenantId), eq(products.isActive, true), isNull(products.deletedAt));

    if (categoryId) {
      conditions = and(conditions, eq(products.categoryId, categoryId as string));
    }
    if (lowStock === "true") {
      conditions = and(conditions, sql`${products.currentStock} <= ${products.minStock}`);
    }

    const rows = await db
      .select({ product: products, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(conditions);

    const filtered = search
      ? rows.filter(r =>
          r.product.name.includes(search as string) ||
          (r.product.sku ?? "").includes(search as string) ||
          (r.product.barcode ?? "").includes(search as string)
        )
      : rows;

    success(res, filtered.map(r => ({ ...r.product, categoryName: r.categoryName })));
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [row] = await db
      .select({ product: products, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.id, req.params.id), eq(products.tenantId, req.user!.tenantId)));
    if (!row) throw new AppError(404, "المنتج غير موجود");
    success(res, { ...row.product, categoryName: row.categoryName });
  } catch (err) { next(err); }
});

router.post("/", requireRole("owner", "admin", "inventory_manager"), async (req, res, next) => {
  try {
    const parsed = insertProductSchema.safeParse({ ...req.body, tenantId: req.user!.tenantId, createdBy: req.user!.userId });
    if (!parsed.success) throw new AppError(422, "بيانات غير صحيحة", parsed.error.flatten().fieldErrors);
    const [row] = await db.insert(products).values(parsed.data).returning();
    created(res, row);
  } catch (err) { next(err); }
});

router.put("/:id", requireRole("owner", "admin", "inventory_manager"), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    // Mass assignment protection — whitelist only allowed fields
    const { name, barcode, sku, salePrice, purchasePrice, taxPercent,
            categoryId, minStock, unit, isActive, imageUrl } = req.body;
    const [row] = await db.update(products)
      .set({ name, barcode, sku, salePrice, purchasePrice, taxPercent,
             categoryId, minStock, unit, isActive, imageUrl, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, req.user!.tenantId)))
      .returning();
    if (!row) throw new AppError(404, "المنتج غير موجود");
    success(res, row);
  } catch (err) { next(err); }
});

router.delete("/:id", requireRole("owner", "admin", "inventory_manager"), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const [row] = await db.update(products).set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() }).where(and(eq(products.id, id), eq(products.tenantId, req.user!.tenantId))).returning();
    if (!row) throw new AppError(404, "المنتج غير موجود");
    success(res, { message: "تم حذف المنتج بنجاح" });
  } catch (err) { next(err); }
});

export default router;
