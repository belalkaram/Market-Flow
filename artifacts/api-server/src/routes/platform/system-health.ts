import { Router } from "express";
import { db } from "@workspace/db";
import { tenants, users, activityLogs } from "@workspace/db/schema";
import { gte, count } from "drizzle-orm";
import { requireSuperAdmin } from "../../middlewares/platformAuth";
import { success } from "../../utils/response";
import { sql } from "drizzle-orm";
import { getMaintenanceStatus, setMaintenanceStatus } from "../../utils/maintenance";

const router = Router();
router.use(requireSuperAdmin);

router.get("/", async (req, res, next) => {
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbResponseTime = Date.now() - dbStart;

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [storeCount, userCount, opsCount] = await Promise.all([
      db.select({ count: count() }).from(tenants),
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(activityLogs).where(gte(activityLogs.createdAt, yesterday)),
    ]);

    const uptimeSec = process.uptime();
    const uptimeHrs = Math.floor(uptimeSec / 3600);
    const uptimeMins = Math.floor((uptimeSec % 3600) / 60);

    success(res, {
      api: { status: "ok", responseTime: `${dbResponseTime}ms` },
      database: { status: "ok", responseTime: `${dbResponseTime}ms` },
      storage: { status: "ok", usage: "N/A" },
      notifications: { status: "ok" },
      stats: {
        totalStores: Number(storeCount[0]?.count ?? 0),
        totalUsers: Number(userCount[0]?.count ?? 0),
        opsLast24h: Number(opsCount[0]?.count ?? 0),
      },
      uptime: `${uptimeHrs}ساعة ${uptimeMins}دقيقة`,
      nodeVersion: process.version,
      memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    });
  } catch (err) { next(err); }
});

router.get("/maintenance", async (req, res, next) => {
  try {
    const status = getMaintenanceStatus();
    success(res, status);
  } catch (err) { next(err); }
});

router.put("/maintenance", async (req, res, next) => {
  try {
    const { enabled, message } = req.body;
    if (typeof enabled !== "boolean") {
      res.status(400).json({ success: false, message: "حالة التفعيل غير صحيحة" });
      return;
    }
    const ok = setMaintenanceStatus(enabled, message || "");
    if (!ok) {
      res.status(500).json({ success: false, message: "فشل حفظ إعدادات وضع الصيانة" });
      return;
    }
    success(res, { updated: true });
  } catch (err) { next(err); }
});

export default router;
