import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { success } from "../utils/response";
import { sql } from "drizzle-orm";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const rows = await db.execute(
      sql`SELECT * FROM order_requests WHERE tenant_id = ${tenantId} ORDER BY created_at DESC`
    );
    success(res, rows.rows);
  } catch (err) { next(err); }
});

router.put("/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    const { status } = z.object({ status: z.string() }).parse(req.body);
    const rows = await db.execute(sql`
      UPDATE order_requests
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id} AND tenant_id = ${tenantId}
      RETURNING *
    `);
    if (rows.rows.length === 0) {
      res.status(404).json({ success: false, message: "الطلب غير موجود" });
      return;
    }
    success(res, rows.rows[0]);
  } catch (err) { next(err); }
});

router.post("/:id/convert-to-sale", async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;

    const orderRows = await db.execute(sql`
      SELECT * FROM order_requests WHERE id = ${id} AND tenant_id = ${tenantId}
    `);
    if (orderRows.rows.length === 0) {
      res.status(404).json({ success: false, message: 'الطلب غير موجود' });
      return;
    }
    const order = orderRows.rows[0] as any;
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    const saleRows = await db.execute(sql`
      INSERT INTO sales_orders (
        tenant_id, created_by_id, customer_name, customer_phone,
        payment_method, subtotal, discount, tax, total, notes, status, order_type
      ) VALUES (
        ${tenantId}, ${userId},
        ${order.customer_name}, ${order.customer_phone},
        ${order.payment_method ?? 'cash'},
        ${order.subtotal}, ${order.discount ?? 0}, 0, ${order.total},
        ${order.notes ?? null}, 'completed', 'sale'
      ) RETURNING id
    `);
    const saleId = (saleRows.rows[0] as any).id;

    for (const item of items) {
      await db.execute(sql`
        INSERT INTO sales_order_items (
          sale_order_id, product_id, product_name, quantity, unit_price, discount, tax, subtotal
        ) VALUES (
          ${saleId}, ${item.productId}, ${item.productName},
          ${item.quantity}, ${item.unitPrice}, 0, 0, ${item.totalPrice ?? item.quantity * item.unitPrice}
        )
      `);
    }

    await db.execute(sql`
      UPDATE order_requests
      SET status = 'converted_to_sale', updated_at = NOW()
      WHERE id = ${id} AND tenant_id = ${tenantId}
    `);

    success(res, { saleId, message: 'تم تحويل الطلب إلى فاتورة بيع بنجاح' });
  } catch (err) { next(err); }
});

export default router;
