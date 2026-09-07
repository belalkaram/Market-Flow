import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { sql } from "drizzle-orm";

const router = Router();
router.use(requireAuth);

const itemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
  totalPrice: z.number(),
});

const createSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(9),
  customerAddress: z.string().optional(),
  customerArea: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.string(),
  deliveryMethod: z.string(),
  items: z.array(itemSchema).min(1),
  subtotal: z.number(),
  discount: z.number().default(0),
  deliveryFee: z.number().default(0),
  total: z.number(),
  branchId: z.string().optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const rows = await db.execute(
      sql`SELECT * FROM order_requests WHERE tenant_id = ${tenantId} ORDER BY created_at DESC`
    );
    success(res, rows.rows);
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    const body = createSchema.parse(req.body);

    const rows = await db.execute(sql`
      INSERT INTO order_requests (
        tenant_id, created_by_id, customer_name, customer_phone,
        customer_address, customer_area, notes, payment_method, delivery_method,
        items, subtotal, discount, delivery_fee, total, status, branch_id
      ) VALUES (
        ${tenantId}, ${userId},
        ${body.customerName}, ${body.customerPhone},
        ${body.customerAddress ?? null}, ${body.customerArea ?? null},
        ${body.notes ?? null}, ${body.paymentMethod}, ${body.deliveryMethod},
        ${JSON.stringify(body.items)}, ${body.subtotal}, ${body.discount},
        ${body.deliveryFee}, ${body.total}, 'sent_to_whatsapp', ${body.branchId ?? null}
      ) RETURNING *
    `);
    created(res, rows.rows[0]);
  } catch (err) { next(err); }
});

router.patch("/:id/status", async (req, res, next) => {
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

export default router;
