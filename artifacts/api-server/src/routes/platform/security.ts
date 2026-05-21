import { Router } from "express";
import { db } from "@workspace/db";
import { securityLogs, users } from "@workspace/db/schema";
import { eq, desc, gte, and, count, isNotNull } from "drizzle-orm";
import { requireSuperAdmin } from "../../middlewares/platformAuth";
import { success } from "../../utils/response";
import { AppError } from "../../middlewares/errorHandler";
import { sql } from "drizzle-orm";

const router = Router();
router.use(requireSuperAdmin);

router.get("/", async (req, res, next) => {
  try {
    const { dateFrom, dateTo, severity, event: eventFilter } = req.query as Record<string, string>;

    const conditions: any[] = [];
    if (severity) conditions.push(eq(securityLogs.severity, severity));
    if (eventFilter) conditions.push(eq(securityLogs.event, eventFilter));
    if (dateFrom) conditions.push(gte(securityLogs.createdAt, new Date(dateFrom)));
    if (dateTo) conditions.push(gte(securityLogs.createdAt, new Date(dateTo)));

    const logs = await db.select().from(securityLogs)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(securityLogs.createdAt))
      .limit(300);

    success(res, logs);
  } catch (err) { next(err); }
});

router.get("/stats", async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [failedLogins, lockedAccounts, criticalEvents, allToday] = await Promise.all([
      db.select({ count: count() }).from(securityLogs)
        .where(and(eq(securityLogs.event, "login_failed_wrong_password"), gte(securityLogs.createdAt, today))),
      db.select({ count: count() }).from(users)
        .where(and(isNotNull(users.accountLockedUntil), sql`${users.accountLockedUntil} > NOW()`)),
      db.select({ count: count() }).from(securityLogs)
        .where(and(eq(securityLogs.severity, "critical"), gte(securityLogs.createdAt, today))),
      db.select({ count: count() }).from(securityLogs)
        .where(gte(securityLogs.createdAt, today)),
    ]);

    const recentCritical = await db.select().from(securityLogs)
      .where(and(eq(securityLogs.severity, "critical")))
      .orderBy(desc(securityLogs.createdAt))
      .limit(10);

    success(res, {
      failedLoginsToday: Number(failedLogins[0]?.count ?? 0),
      lockedAccounts: Number(lockedAccounts[0]?.count ?? 0),
      criticalEventsToday: Number(criticalEvents[0]?.count ?? 0),
      totalEventsToday: Number(allToday[0]?.count ?? 0),
      recentCritical,
    });
  } catch (err) { next(err); }
});

router.post("/unlock-user/:id", async (req, res, next) => {
  try {
    const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, req.params.id)).limit(1);
    if (!user) throw new AppError(404, "المستخدم غير موجود");

    await db.update(users).set({
      failedLoginAttempts: 0,
      accountLockedUntil: null,
    }).where(eq(users.id, req.params.id));

    success(res, { message: `تم فتح حساب ${user.name}` });
  } catch (err) { next(err); }
});

router.post("/force-reset-password/:id", async (req, res, next) => {
  try {
    const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, req.params.id)).limit(1);
    if (!user) throw new AppError(404, "المستخدم غير موجود");

    await db.update(users).set({ mustChangePassword: true }).where(eq(users.id, req.params.id));
    success(res, { message: `سيُطلب من ${user.name} تغيير كلمة المرور عند الدخول` });
  } catch (err) { next(err); }
});

router.get("/locked-users", async (req, res, next) => {
  try {
    const locked = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      tenantId: users.tenantId,
      accountLockedUntil: users.accountLockedUntil,
      failedLoginAttempts: users.failedLoginAttempts,
    }).from(users)
      .where(and(isNotNull(users.accountLockedUntil), sql`${users.accountLockedUntil} > NOW()`));

    success(res, locked);
  } catch (err) { next(err); }
});

export default router;
