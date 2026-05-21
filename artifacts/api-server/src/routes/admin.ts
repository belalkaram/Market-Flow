import { Router } from "express";
import { eq, count } from "drizzle-orm";
import { db } from "@workspace/db";
import { tenants, users, products, salesOrders, tasks, branches } from "@workspace/db/schema";
import { requireAuth, requireRole } from "../middlewares/auth";
import { success } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";
import { runSeed, clearDemoData } from "../services/seed.service";

const router = Router();
router.use(requireAuth);

router.get("/demo/status", async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const [
      [tenant],
      userCount,
      productCount,
      orderCount,
      taskCount,
      branchCount,
    ] = await Promise.all([
      db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1),
      db.select({ count: count() }).from(users).where(eq(users.tenantId, tenantId)),
      db.select({ count: count() }).from(products).where(eq(products.tenantId, tenantId)),
      db.select({ count: count() }).from(salesOrders).where(eq(salesOrders.tenantId, tenantId)),
      db.select({ count: count() }).from(tasks).where(eq(tasks.tenantId, tenantId)),
      db.select({ count: count() }).from(branches).where(eq(branches.tenantId, tenantId)),
    ]);

    success(res, {
      tenant,
      counts: {
        users: userCount[0]?.count ?? 0,
        products: productCount[0]?.count ?? 0,
        orders: orderCount[0]?.count ?? 0,
        tasks: taskCount[0]?.count ?? 0,
        branches: branchCount[0]?.count ?? 0,
      },
      dbStatus: "healthy",
    });
  } catch (err) { next(err); }
});

router.post("/demo/seed", requireRole("owner", "admin"), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    await runSeed(tenantId);
    success(res, { message: "تم تهيئة البيانات التجريبية بنجاح" });
  } catch (err) { next(err); }
});

router.post("/demo/reset", requireRole("owner", "admin"), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    await clearDemoData(tenantId);
    await runSeed(tenantId);
    success(res, { message: "تم إعادة تعيين البيانات التجريبية بنجاح" });
  } catch (err) { next(err); }
});

router.delete("/demo/clear", requireRole("owner", "admin"), async (req, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    await clearDemoData(tenantId);
    success(res, { message: "تم مسح البيانات التجريبية بنجاح" });
  } catch (err) { next(err); }
});

export default router;
