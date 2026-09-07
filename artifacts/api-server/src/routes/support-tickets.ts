import { Router } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { success, created } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";
import { sql, eq, desc, and } from "drizzle-orm";

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  title: z.string().min(3),
  department: z.string(),
  description: z.string().min(10),
  priority: z.enum(["low", "medium", "high", "critical"]),
  branchId: z.string().optional(),
});

const updateSchema = z.object({
  status: z.enum(["open", "in_progress", "waiting_customer", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  internalNote: z.string().optional(),
  replyMessage: z.string().optional(),
  assignedTo: z.string().optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const rows = await db.execute(
      sql`SELECT * FROM support_tickets WHERE tenant_id = ${tenantId} ORDER BY created_at DESC`
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
      INSERT INTO support_tickets (tenant_id, created_by_id, title, department, description, priority, status, branch_id)
      VALUES (${tenantId}, ${userId}, ${body.title}, ${body.department}, ${body.description}, ${body.priority}, 'open', ${body.branchId ?? null})
      RETURNING *
    `);
    created(res, rows.rows[0]);
  } catch (err) { next(err); }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    const body = updateSchema.parse(req.body);

    const existing = await db.execute(
      sql`SELECT id FROM support_tickets WHERE id = ${id} AND tenant_id = ${tenantId}`
    );
    if (existing.rows.length === 0) {
      throw new AppError(404, "التذكرة غير موجودة");
    }

    const rows = await db.execute(sql`
      UPDATE support_tickets
      SET 
        status = COALESCE(${body.status ?? null}, status),
        priority = COALESCE(${body.priority ?? null}, priority),
        internal_note = COALESCE(${body.internalNote ?? null}, internal_note),
        reply_message = COALESCE(${body.replyMessage ?? null}, reply_message),
        assigned_to = COALESCE(${body.assignedTo ?? null}, assigned_to),
        updated_at = NOW()
      WHERE id = ${id} AND tenant_id = ${tenantId}
      RETURNING *
    `);
    success(res, rows.rows[0] ?? { id });
  } catch (err) { next(err); }
});

export default router;
