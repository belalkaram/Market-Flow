import { Router } from "express";
import { db } from "@workspace/db";
import { activityLogs } from "@workspace/db/schema";
import { eq, desc, gte, lte, and, count } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";
import { success } from "../utils/response";

const router = Router();
router.use(requireAuth);
router.use(requireRole("owner", "admin"));

router.get("/", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const { search, action, dateFrom, dateTo } = req.query as Record<string, string>;

    const conditions: any[] = [eq(activityLogs.tenantId, tenantId)];
    if (action) conditions.push(eq(activityLogs.action, action));
    if (dateFrom) conditions.push(gte(activityLogs.createdAt, new Date(dateFrom)));
    if (dateTo) conditions.push(lte(activityLogs.createdAt, new Date(dateTo)));

    let rows = await db.select().from(activityLogs)
      .where(and(...conditions))
      .orderBy(desc(activityLogs.createdAt))
      .limit(500);

    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(r =>
        r.details?.toLowerCase().includes(s) ||
        r.userName?.toLowerCase().includes(s) ||
        r.page?.toLowerCase().includes(s)
      );
    }

    success(res, rows);
  } catch (err) { next(err); }
});

router.get("/stats", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = await db.select().from(activityLogs)
      .where(and(eq(activityLogs.tenantId, tenantId), gte(activityLogs.createdAt, today)));

    const moduleCounts: Record<string, number> = {};
    const userCounts: Record<string, { name: string; count: number }> = {};

    todayLogs.forEach((l) => {
      if (l.page) moduleCounts[l.page] = (moduleCounts[l.page] || 0) + 1;
      if (l.userId && l.userName) {
        if (!userCounts[l.userId]) userCounts[l.userId] = { name: l.userName, count: 0 };
        userCounts[l.userId].count++;
      }
    });

    const topModule = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
    const topEmployee = Object.values(userCounts).sort((a, b) => b.count - a.count)[0]?.name ?? '-';

    success(res, {
      todayTotal: todayLogs.length,
      todaySuccess: todayLogs.length,
      todayFailed: 0,
      todayCritical: 0,
      topModule,
      topEmployee,
    });
  } catch (err) { next(err); }
});

export default router;
