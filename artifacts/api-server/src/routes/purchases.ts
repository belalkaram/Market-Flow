import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { purchaseOrders, purchaseOrderItems, products, suppliers, users } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const { search, status } = req.query as Record<string, string>;
    const rows = await db
      .select({ order: purchaseOrders, supplierName: suppliers.name, createdByName: users.name })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .leftJoin(users, eq(purchaseOrders.createdBy, users.id))
      .where(eq(purchaseOrders.tenantId, req.user!.tenantId))
      .orderBy(desc(purchaseOrders.createdAt))
      .limit(500);

    let result = rows.map(r => ({ ...r.order, supplierName: r.supplierName, createdByName: r.createdByName }));

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.orderNumber.toLowerCase().includes(q) ||
        (r.supplierName ?? "").toLowerCase().includes(q)
      );
    }
    if (status) result = result.filter(r => r.status === status);

    success(res, result);
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [row] = await db.select().from(purchaseOrders).where(and(eq(purchaseOrders.id, req.params.id), eq(purchaseOrders.tenantId, req.user!.tenantId)));
    if (!row) throw new AppError(404, "طلب الشراء غير موجود");
    const items = await db
      .select({ item: purchaseOrderItems, productName: products.name })
      .from(purchaseOrderItems)
      .leftJoin(products, eq(purchaseOrderItems.productId, products.id))
      .where(eq(purchaseOrderItems.purchaseOrderId, req.params.id));
    const [supplier] = row.supplierId ? await db.select().from(suppliers).where(eq(suppliers.id, row.supplierId)) : [null];
    const [creator] = row.createdBy ? await db.select().from(users).where(eq(users.id, row.createdBy)) : [null];
    success(res, { ...row, items, supplierName: supplier?.name, createdByName: creator?.name });
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const { items, ...orderData } = req.body;
    const orderNumber = `PO-${Date.now().toString().slice(-8)}`;

    let totalAmount = 0;
    if (items && Array.isArray(items)) {
      for (const item of items) {
        totalAmount += Number(item.unitPrice) * Number(item.quantity);
      }
    }

    const [order] = await db.insert(purchaseOrders).values({
      ...orderData,
      tenantId,
      orderNumber,
      totalAmount: String(totalAmount),
      createdBy: req.user!.userId,
    }).returning();

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await db.insert(purchaseOrderItems).values({
          ...item,
          purchaseOrderId: order.id,
          totalPrice: String(Number(item.unitPrice) * Number(item.quantity)),
        });
      }
    }

    created(res, order);
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const [row] = await db.update(purchaseOrders)
      .set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(purchaseOrders.id, req.params.id), eq(purchaseOrders.tenantId, req.user!.tenantId)))
      .returning();
    if (!row) throw new AppError(404, "طلب الشراء غير موجود");
    success(res, row);
  } catch (err) { next(err); }
});

// Receive purchase order — update stock
router.post("/:id/receive", async (req, res, next) => {
  try {
    const [order] = await db.select().from(purchaseOrders).where(and(eq(purchaseOrders.id, req.params.id), eq(purchaseOrders.tenantId, req.user!.tenantId)));
    if (!order) throw new AppError(404, "طلب الشراء غير موجود");
    if (order.status === "received") throw new AppError(422, "تم استلام هذا الطلب مسبقاً");
    if (order.status === "cancelled") throw new AppError(422, "الطلب ملغي ولا يمكن استلامه");

    const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, req.params.id));
    for (const item of items) {
      const [prod] = await db.select().from(products).where(eq(products.id, item.productId));
      if (prod) {
        await db.update(products).set({ currentStock: prod.currentStock + item.quantity, updatedAt: new Date() }).where(eq(products.id, item.productId));
      }
      await db.update(purchaseOrderItems).set({ receivedQuantity: item.quantity }).where(eq(purchaseOrderItems.id, item.id));
    }

    const [updated] = await db.update(purchaseOrders)
      .set({ status: "received", receivedAt: new Date(), updatedAt: new Date() })
      .where(eq(purchaseOrders.id, req.params.id))
      .returning();
    success(res, updated);
  } catch (err) { next(err); }
});

// Cancel purchase order
router.delete("/:id", async (req, res, next) => {
  try {
    const [order] = await db.select().from(purchaseOrders).where(and(eq(purchaseOrders.id, req.params.id), eq(purchaseOrders.tenantId, req.user!.tenantId)));
    if (!order) throw new AppError(404, "طلب الشراء غير موجود");
    if (order.status === "received") throw new AppError(422, "لا يمكن إلغاء طلب مستلم");

    const [updated] = await db.update(purchaseOrders)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(purchaseOrders.id, req.params.id))
      .returning();
    success(res, updated);
  } catch (err) { next(err); }
});

export default router;
