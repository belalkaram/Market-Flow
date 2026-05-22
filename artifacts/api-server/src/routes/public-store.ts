import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { sql, inArray, and, eq } from "drizzle-orm";
import { products as productsTable } from "@workspace/db/schema";
import rateLimit from "express-rate-limit";

const router = Router();

const publicOrderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV !== "production" ? 200 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "تجاوزت الحد المسموح به، حاول مجدداً بعد ساعة", code: "RATE_LIMITED" },
});

const publicReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV !== "production" ? 500 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "طلبات كثيرة جداً، حاول لاحقاً", code: "RATE_LIMITED" },
});

const itemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(999),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
});

const submitOrderSchema = z.object({
  customerName: z.string().min(2).max(100).trim(),
  customerPhone: z.string().min(9).max(20).trim(),
  customerAddress: z.string().max(300).trim().optional(),
  customerArea: z.string().max(100).trim().optional(),
  notes: z.string().max(500).trim().optional(),
  paymentMethod: z.enum(["cash_on_delivery", "card", "wallet", "bank_transfer"]),
  deliveryMethod: z.enum(["delivery", "pickup"]),
  items: z.array(itemSchema).min(1).max(100),
  subtotal: z.number().min(0),
  discount: z.number().min(0).default(0),
  deliveryFee: z.number().min(0).default(0),
  total: z.number().min(0),
  _hp: z.string().max(0).optional(),
});

async function getTenant(slug: string) {
  const rows = await db.execute(
    sql`SELECT id, name, currency, status, subscription_status
        FROM tenants
        WHERE slug = ${slug}
          AND deleted_at IS NULL
        LIMIT 1`
  );
  return rows.rows[0] as {
    id: string; name: string; currency: string;
    status: string; subscription_status: string;
  } | undefined;
}

router.get("/:slug/info", publicReadLimiter, async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug || !/^[a-z0-9-]{2,60}$/.test(slug)) {
      res.status(400).json({ success: false, message: "رابط المتجر غير صحيح" });
      return;
    }
    const tenant = await getTenant(slug);
    if (!tenant || tenant.status === "deactivated") {
      res.status(404).json({ success: false, message: "المتجر غير موجود" });
      return;
    }
    const branches = await db.execute(
      sql`SELECT id, name, city, phone FROM branches
          WHERE tenant_id = ${tenant.id} AND is_active = true AND deleted_at IS NULL
          ORDER BY created_at ASC LIMIT 10`
    );
    res.json({
      success: true,
      data: {
        name: tenant.name,
        currency: tenant.currency,
        status: tenant.status,
        branches: branches.rows,
      },
    });
  } catch (err) { next(err); }
});

router.get("/:slug/products", publicReadLimiter, async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug || !/^[a-z0-9-]{2,60}$/.test(slug)) {
      res.status(400).json({ success: false, message: "رابط المتجر غير صحيح" });
      return;
    }
    const tenant = await getTenant(slug);
    if (!tenant || tenant.status === "deactivated") {
      res.status(404).json({ success: false, message: "المتجر غير موجود" });
      return;
    }
    if (tenant.status === "suspended") {
      res.status(403).json({ success: false, message: "المتجر موقوف مؤقتاً" });
      return;
    }

    const rows = await db.execute(sql`
      SELECT
        p.id,
        p.name,
        p.unit,
        p.sale_price AS "salePrice",
        p.tax_percent AS "taxPercent",
        p.current_stock AS "currentStock",
        p.min_stock AS "minStock",
        p.image_url AS "imageUrl",
        c.name AS "categoryName",
        c.id AS "categoryId"
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.tenant_id = ${tenant.id}
        AND p.is_active = true
        AND p.deleted_at IS NULL
        AND p.current_stock > 0
      ORDER BY c.sort_order ASC, p.name ASC
    `);
    const categories = await db.execute(sql`
      SELECT id, name, icon, sort_order AS "sortOrder"
      FROM categories
      WHERE tenant_id = ${tenant.id} AND is_active = true
      ORDER BY sort_order ASC
    `);
    res.json({
      success: true,
      data: { products: rows.rows, categories: categories.rows },
    });
  } catch (err) { next(err); }
});

router.post("/:slug/order", publicOrderLimiter, async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug || !/^[a-z0-9-]{2,60}$/.test(slug)) {
      res.status(400).json({ success: false, message: "رابط المتجر غير صحيح" });
      return;
    }

    if (req.body._hp && req.body._hp.length > 0) {
      res.status(200).json({ success: true, data: { id: "bot-rejected" } });
      return;
    }

    const body = submitOrderSchema.parse(req.body);

    const tenant = await getTenant(slug);
    if (!tenant || tenant.status === "deactivated") {
      res.status(404).json({ success: false, message: "المتجر غير موجود" });
      return;
    }
    if (tenant.status === "suspended") {
      res.status(403).json({ success: false, message: "المتجر موقوف مؤقتاً، لا يمكن استقبال الطلبات حالياً" });
      return;
    }

    const productIds = body.items.map(i => i.productId);
    const dbProductRows = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        salePrice: productsTable.salePrice,
        currentStock: productsTable.currentStock,
        isActive: productsTable.isActive,
      })
      .from(productsTable)
      .where(
        and(
          eq(productsTable.tenantId, tenant.id),
          inArray(productsTable.id, productIds),
          eq(productsTable.isActive, true),
          sql`${productsTable.deletedAt} IS NULL`
        )
      );
    const dbProductMap = new Map(dbProductRows.map(p => [p.id, p]));

    for (const item of body.items) {
      const dbProduct = dbProductMap.get(item.productId);
      if (!dbProduct) {
        res.status(400).json({
          success: false,
          message: `المنتج "${item.productName}" غير متاح`,
          code: "PRODUCT_UNAVAILABLE",
        });
        return;
      }
      if (dbProduct.currentStock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `الكمية المطلوبة من "${item.productName}" غير متوفرة في المخزون (المتاح: ${dbProduct.currentStock})`,
          code: "INSUFFICIENT_STOCK",
        });
        return;
      }
    }

    const verifiedItems = body.items.map(item => {
      const dbProduct = dbProductMap.get(item.productId)!;
      const serverPrice = parseFloat(dbProduct.salePrice);
      return {
        ...item,
        unitPrice: serverPrice,
        totalPrice: serverPrice * item.quantity,
        productName: dbProduct.name,
      };
    });
    const verifiedSubtotal = verifiedItems.reduce((s, i) => s + i.totalPrice, 0);
    const verifiedTotal = verifiedSubtotal - body.discount + body.deliveryFee;

    const branchRow = await db.execute(sql`
      SELECT id FROM branches WHERE tenant_id = ${tenant.id}
        AND is_active = true AND deleted_at IS NULL
      ORDER BY created_at ASC LIMIT 1
    `);
    const branchId = (branchRow.rows[0] as any)?.id ?? null;

    const inserted = await db.execute(sql`
      INSERT INTO order_requests (
        tenant_id, branch_id, customer_name, customer_phone,
        customer_address, customer_area, notes,
        payment_method, delivery_method,
        items, subtotal, discount, delivery_fee, total, status
      ) VALUES (
        ${tenant.id}, ${branchId},
        ${body.customerName}, ${body.customerPhone},
        ${body.customerAddress ?? null}, ${body.customerArea ?? null},
        ${body.notes ?? null},
        ${body.paymentMethod}, ${body.deliveryMethod},
        ${JSON.stringify(verifiedItems)},
        ${verifiedSubtotal}, ${body.discount},
        ${body.deliveryFee}, ${verifiedTotal},
        'new'
      ) RETURNING id, customer_name, total, status, created_at
    `);

    const order = inserted.rows[0] as any;
    res.status(201).json({
      success: true,
      data: {
        id: order.id,
        customerName: order.customer_name,
        total: verifiedTotal,
        status: order.status,
        createdAt: order.created_at,
        storeName: tenant.name,
      },
    });
  } catch (err) {
    if ((err as any)?.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "بيانات الطلب غير صحيحة",
        errors: (err as any).errors,
      });
      return;
    }
    next(err);
  }
});

export default router;
