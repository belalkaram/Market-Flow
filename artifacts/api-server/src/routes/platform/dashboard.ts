import { Router } from "express";
import { and, isNull, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { tenants, users } from "@workspace/db/schema";
import { requireSuperAdmin } from "../../middlewares/platformAuth";
import { success } from "../../utils/response";

const router = Router();
router.use(requireSuperAdmin);

router.get("/summary", async (_req, res, next) => {
  try {
    const [allStores] = await db.select({ count: sql<number>`count(*)` }).from(tenants).where(isNull(tenants.deletedAt));
    const [activeStores] = await db.select({ count: sql<number>`count(*)` }).from(tenants).where(and(eq(tenants.status, "active"), isNull(tenants.deletedAt)));
    const [trialStores] = await db.select({ count: sql<number>`count(*)` }).from(tenants).where(and(eq(tenants.status, "trial"), isNull(tenants.deletedAt)));
    const [suspendedStores] = await db.select({ count: sql<number>`count(*)` }).from(tenants).where(and(eq(tenants.status, "suspended"), isNull(tenants.deletedAt)));
    const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users).where(isNull(users.deletedAt));

    const expiredTrials = await db.select({ count: sql<number>`count(*)` }).from(tenants)
      .where(and(
        eq(tenants.status, "trial"),
        isNull(tenants.deletedAt),
        sql`${tenants.trialEndsAt} < now()`,
      ));

    success(res, {
      totalStores: Number(allStores.count),
      activeStores: Number(activeStores.count),
      trialStores: Number(trialStores.count),
      suspendedStores: Number(suspendedStores.count),
      expiredTrials: Number(expiredTrials[0]?.count ?? 0),
      totalUsers: Number(totalUsers.count),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
