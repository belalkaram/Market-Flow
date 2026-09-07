import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { purchaseOrders, purchaseOrderItems, products, suppliers, users } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth";
import { validateBody } from "../middlewares/validateBody";
import { createPurchaseOrderSchema, purchaseOrderItemSchema, receivePurchaseOrderSchema } from "../schemas/purchaseSchemas";
import { success, created } from "../utils/response";
import { sanitizeText } from "../utils/sanitizer";
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
    const orderId = req.params.id as string;
    const [row] = await db.select().from(purchaseOrders).where(and(eq(purchaseOrders.id, orderId), eq(purchaseOrders.tenantId, req.user!.tenantId)));
    if (!row) throw new AppError(404, "طلب الشراء غير موجود");
    const items = await db
      .select({ item: purchaseOrderItems, productName: products.name })
      .from(purchaseOrderItems)
      .leftJoin(products, eq(purchaseOrderItems.productId, products.id))
      .where(eq(purchaseOrderItems.purchaseOrderId, orderId));
    const [supplier] = row.supplierId ? await db.select().from(suppliers).where(eq(suppliers.id, row.supplierId)) : [null];
    const [creator] = row.createdBy ? await db.select().from(users).where(eq(users.id, row.createdBy)) : [null];
    success(res, { ...row, items, supplierName: supplier?.name, createdByName: creator?.name });
  } catch (err) { next(err); }
});

router.post("/", validateBody(createPurchaseOrderSchema), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const { items, ...orderData } = req.body as any;
    const orderNumber = `PO-${Date.now().toString().slice(-8)}`;

    const result = await db.transaction(async (tx) => {
      // validate supplier tenant if supplierId provided
      if (orderData.supplierId) {
        const [sup] = await tx.select().from(suppliers).where(and(eq(suppliers.id, orderData.supplierId), eq(suppliers.tenantId, tenantId)));
        if (!sup) throw new AppError(400, "المورد غير صالح أو لا ينتمي لنفس المتجر");
      }

      // validate products and calculate totals
      let totalAmount = 0;
      for (const item of items) {
        const qty = Number(item.quantity);
        const price = Number(item.unitPrice);
        if (!Number.isFinite(qty) || !Number.isFinite(price) || qty <= 0 || price < 0) throw new AppError(400, "قيمة الكمية أو السعر غير صالحة");
        const [prod] = await tx.select().from(products).where(and(eq(products.id, item.productId), eq(products.tenantId, tenantId)));
        if (!prod) throw new AppError(400, `المنتج ${item.productId} غير موجود أو لا ينتمي لمتجرك`);
        totalAmount += price * qty;
      }

      const safeOrderData = { ...orderData, notes: sanitizeText(orderData.notes || "") };
      const [order] = await tx.insert(purchaseOrders).values({
        ...safeOrderData,
        tenantId,
        orderNumber,
        totalAmount: String(totalAmount),
        createdBy: req.user!.userId,
      }).returning();

      // insert items
      for (const item of items) {
        const qty = Number(item.quantity);
        const price = Number(item.unitPrice);
        await tx.insert(purchaseOrderItems).values({
          productId: item.productId,
          purchaseOrderId: order.id,
          quantity: qty,
          unitPrice: String(price),
          totalPrice: String(price * qty),
        });
      }

      return order;
    });

    created(res, result);
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const orderId = req.params.id as string;
    const [row] = await db.update(purchaseOrders)
      .set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(purchaseOrders.id, orderId), eq(purchaseOrders.tenantId, req.user!.tenantId)))
      .returning();
    if (!row) throw new AppError(404, "طلب الشراء غير موجود");
    success(res, row);
  } catch (err) { next(err); }
});

// Receive purchase order — update stock
router.post("/:id/receive", validateBody(receivePurchaseOrderSchema), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const orderId = req.params.id as string;
    const result = await db.transaction(async (tx) => {
      const [order] = await tx.select().from(purchaseOrders).where(and(eq(purchaseOrders.id, orderId), eq(purchaseOrders.tenantId, tenantId)));
      if (!order) throw new AppError(404, "طلب الشراء غير موجود");
      if (order.status === "received") throw new AppError(422, "تم استلام هذا الطلب مسبقاً");
      if (order.status === "cancelled") throw new AppError(422, "الطلب ملغي ولا يمكن استلامه");

      const items = await tx.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, orderId));
      for (const item of items) {
        const [prod] = await tx.select().from(products).where(and(eq(products.id, item.productId), eq(products.tenantId, tenantId)));
        if (!prod) throw new AppError(400, `المنتج ${item.productId} غير موجود أو لا ينتمي لمتجرك`);
        const newStock = prod.currentStock + item.quantity;
        const [updatedProd] = await tx.update(products).set({ currentStock: newStock, updatedAt: new Date() }).where(and(eq(products.id, item.productId), eq(products.tenantId, tenantId))).returning();
        if (!updatedProd) throw new AppError(500, `فشل تحديث المخزون للمنتج ${item.productId}`);

        await tx.update(purchaseOrderItems).set({ receivedQuantity: item.quantity }).where(eq(purchaseOrderItems.id, item.id));
        // TODO: insert stock movement / audit record if schema supports it
      }

      const [updated] = await tx.update(purchaseOrders)
        .set({ status: "received", receivedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(purchaseOrders.id, orderId), eq(purchaseOrders.tenantId, tenantId)))
        .returning();

      return updated;
    });

    success(res, result);
  } catch (err) { next(err); }
});

// Cancel purchase order
router.delete("/:id", async (req, res, next) => {
  try {
    const orderId = req.params.id as string;
    const [order] = await db.select().from(purchaseOrders).where(and(eq(purchaseOrders.id, orderId), eq(purchaseOrders.tenantId, req.user!.tenantId)));
    if (!order) throw new AppError(404, "طلب الشراء غير موجود");
    if (order.status === "received") throw new AppError(422, "لا يمكن إلغاء طلب مستلم");

    const [updated] = await db.update(purchaseOrders)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(purchaseOrders.id, orderId))
      .returning();
    success(res, updated);
  } catch (err) { next(err); }
});

export default router;
