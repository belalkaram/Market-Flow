import { Router } from "express";
import { db } from "@workspace/db";
import { activityLogs } from "@workspace/db/schema";
import { desc, gte, lte, eq, and } from "drizzle-orm";
import { requireSuperAdmin } from "../../middlewares/platformAuth";
import { success } from "../../utils/response";

const router = Router();
router.use(requireSuperAdmin);

router.get("/", async (req, res, next) => {
  try {
    const { action, tenantId, dateFrom, dateTo } = req.query as Record<string, string>;

    const conditions: any[] = [];
    if (action) conditions.push(eq(activityLogs.action, action));
    if (tenantId) conditions.push(eq(activityLogs.tenantId, tenantId));
    if (dateFrom) conditions.push(gte(activityLogs.createdAt, new Date(dateFrom)));
    if (dateTo) conditions.push(lte(activityLogs.createdAt, new Date(dateTo)));

    const rows = await db.select().from(activityLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(activityLogs.createdAt))
      .limit(1000);

    success(res, rows);
  } catch (err) { next(err); }
});

export default router;
