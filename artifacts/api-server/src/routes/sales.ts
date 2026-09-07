import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { salesOrders, salesOrderItems, products, customers, users } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const { search, status, dateFrom, dateTo } = req.query as Record<string, string>;
    const rows = await db
      .select({
        order: salesOrders,
        customerName: customers.name,
        cashierName: users.name,
      })
      .from(salesOrders)
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .leftJoin(users, eq(salesOrders.cashierId, users.id))
      .where(eq(salesOrders.tenantId, tenantId))
      .orderBy(desc(salesOrders.createdAt))
      .limit(500);

    let result = rows.map(r => ({ ...r.order, customerName: r.customerName ?? "نقدي", cashierName: r.cashierName }));

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.invoiceNumber.toLowerCase().includes(q) ||
        (r.customerName ?? "").toLowerCase().includes(q) ||
        (r.cashierName ?? "").toLowerCase().includes(q)
      );
    }
    if (status) result = result.filter(r => r.status === status);
    if (dateFrom) result = result.filter(r => new Date(r.createdAt) >= new Date(dateFrom));
    if (dateTo) result = result.filter(r => new Date(r.createdAt) <= new Date(dateTo + "T23:59:59"));

    success(res, result);
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [row] = await db.select().from(salesOrders).where(and(eq(salesOrders.id, req.params.id), eq(salesOrders.tenantId, req.user!.tenantId)));
    if (!row) throw new AppError(404, "الفاتورة غير موجودة");
    const items = await db
      .select({ item: salesOrderItems, product: products })
      .from(salesOrderItems)
      .leftJoin(products, eq(salesOrderItems.productId, products.id))
      .where(eq(salesOrderItems.salesOrderId, req.params.id));
    const [customer] = row.customerId ? await db.select().from(customers).where(eq(customers.id, row.customerId)) : [null];
    const [cashier] = row.cashierId ? await db.select().from(users).where(eq(users.id, row.cashierId)) : [null];
    success(res, { ...row, items, customerName: customer?.name ?? "نقدي", cashierName: cashier?.name });
  } catch (err) { next(err); }
});

// POS Checkout — server-side price calc, DB transaction, IDOR-safe
router.post("/checkout", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const { items, customerId, paymentMethod, discountAmount, notes, taxEnabled, allowNegative } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError(422, "يجب إضافة منتج واحد على الأقل");
    }

    const safeNotes = typeof notes === "string" ? notes.slice(0, 500).replace(/<[^>]+>/g, "") : undefined;
    const safePaymentMethod = ["cash", "card", "transfer", "other"].includes(paymentMethod) ? paymentMethod : "cash";

    const result = await db.transaction(async (tx) => {
      let subtotal = 0;
      let taxAmount = 0;
      const orderItems: typeof salesOrderItems.$inferInsert[] = [];

      for (const item of items) {
        const qty = parseInt(item.quantity, 10);
        if (!qty || qty <= 0) throw new AppError(422, "الكمية يجب أن تكون أكبر من صفر");

        // Always fetch price from DB — never trust client-sent price
        const [product] = await tx.select().from(products).where(and(eq(products.id, item.productId), eq(products.tenantId, tenantId)));
        if (!product) throw new AppError(404, "المنتج غير موجود");
        if (!product.isActive) throw new AppError(422, `المنتج "${product.name}" غير متاح`);
        if (!allowNegative && product.currentStock < qty) throw new AppError(422, `الكمية المتاحة من "${product.name}" هي ${product.currentStock} فقط`);

        const price = Number(product.salePrice);
        // Force tax to 0 if tax is globally disabled in settings!
        const tax = (taxEnabled !== false) ? Number(product.taxPercent ?? 0) : 0;
        const itemTotal = price * qty;
        const itemTax = (itemTotal * tax) / 100;

        subtotal += itemTotal;
        taxAmount += itemTax;
        orderItems.push({ 
          productId: product.id, 
          productName: product.name, 
          quantity: qty, 
          unitPrice: product.salePrice, 
          discountAmount: "0", 
          taxPercent: (taxEnabled !== false) ? product.taxPercent : "0", 
          totalPrice: String(itemTotal), 
          salesOrderId: "" 
        } as any);
      }

      const discount = Math.max(0, Number(discountAmount ?? 0));
      const total = Math.max(0, subtotal + taxAmount - discount);
      const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

      const [order] = await tx.insert(salesOrders).values({
        tenantId,
        branchId: req.user!.branchId,
        customerId: customerId || null,
        cashierId: req.user!.userId,
        invoiceNumber,
        status: "completed",
        paymentMethod: safePaymentMethod,
        subtotal: String(subtotal),
        discountAmount: String(discount),
        taxAmount: String(taxAmount),
        totalAmount: String(total),
        notes: safeNotes,
      }).returning();

      for (const oi of orderItems) {
        await tx.insert(salesOrderItems).values({ ...oi, salesOrderId: order.id });
      }
      // Deduct stock after all items inserted (already verified above)
      for (const item of items) {
        const qty = parseInt(item.quantity, 10);
        const [freshProd] = await tx.select({ stock: products.currentStock }).from(products).where(and(eq(products.id, item.productId), eq(products.tenantId, tenantId)));
        await tx.update(products).set({ currentStock: (freshProd?.stock ?? 0) - qty, updatedAt: new Date() }).where(and(eq(products.id, item.productId), eq(products.tenantId, tenantId)));
      }

      return order;
    });

    const fullItems = await db.select({ item: salesOrderItems, product: products }).from(salesOrderItems).leftJoin(products, eq(salesOrderItems.productId, products.id)).where(eq(salesOrderItems.salesOrderId, result.id));
    const [cashier] = result.cashierId ? await db.select({ name: users.name }).from(users).where(eq(users.id, result.cashierId)) : [null];

    created(res, { ...result, items: fullItems, cashierName: cashier?.name });
  } catch (err) { next(err); }
});

// Refund a sale — IDOR-safe, DB transaction
router.post("/:id/refund", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;

    const updated = await db.transaction(async (tx) => {
      const [order] = await tx.select().from(salesOrders).where(and(eq(salesOrders.id, req.params.id), eq(salesOrders.tenantId, tenantId)));
      if (!order) throw new AppError(404, "الفاتورة غير موجودة");
      if (order.status === "returned") throw new AppError(422, "تم إرجاع هذه الفاتورة مسبقاً");
      if (order.status === "cancelled") throw new AppError(422, "الفاتورة ملغية ولا يمكن إرجاعها");

      const items = await tx.select().from(salesOrderItems).where(eq(salesOrderItems.salesOrderId, req.params.id));
      for (const item of items) {
        const [prod] = await tx.select({ stock: products.currentStock }).from(products).where(and(eq(products.id, item.productId), eq(products.tenantId, tenantId)));
        if (prod) {
          await tx.update(products).set({ currentStock: prod.stock + item.quantity, updatedAt: new Date() }).where(eq(products.id, item.productId));
        }
      }

      const [updatedOrder] = await tx.update(salesOrders).set({ status: "returned", updatedAt: new Date() }).where(eq(salesOrders.id, req.params.id)).returning();
      return updatedOrder;
    });

    success(res, updated);
  } catch (err) { next(err); }
});

export default router;
