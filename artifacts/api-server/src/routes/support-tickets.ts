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
    const body = updateSchema.parse(req.body);
    const parts: string[] = [];
    if (body.status) parts.push(`status = '${body.status}'`);
    if (body.priority) parts.push(`priority = '${body.priority}'`);
    if (body.internalNote !== undefined) parts.push(`internal_note = '${body.internalNote.replace(/'/g, "''")}'`);
    if (body.replyMessage !== undefined) parts.push(`reply_message = '${body.replyMessage.replace(/'/g, "''")}'`);
    if (body.assignedTo) parts.push(`assigned_to = '${body.assignedTo}'`);
    parts.push("updated_at = NOW()");

    const rows = await db.execute(sql.raw(`UPDATE support_tickets SET ${parts.join(', ')} WHERE id = '${id}' RETURNING *`));
    success(res, rows.rows[0] ?? { id });
  } catch (err) { next(err); }
});

export default router;
