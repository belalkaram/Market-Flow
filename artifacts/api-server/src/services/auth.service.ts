import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { users, roles, tenants } from "@workspace/db/schema";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt";
import { AppError } from "../middlewares/errorHandler";
import { JwtPayload } from "../middlewares/auth";
import { logSecurity } from "./security.service";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

function getTrialInfo(tenant: typeof tenants.$inferSelect | null) {
  if (!tenant) return {};
  const now = new Date();
  const trialEndsAt = tenant.trialEndsAt ? new Date(tenant.trialEndsAt) : null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;
  const isTrialExpired = trialEndsAt ? now > trialEndsAt : false;
  return {
    tenantStatus: tenant.status,
    subscriptionStatus: tenant.subscriptionStatus,
    trialEndsAt: tenant.trialEndsAt?.toISOString() ?? null,
    trialDaysLeft,
    isTrialExpired,
  };
}

export async function loginUser(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string,
) {
  const GENERIC_ERROR = "بيانات الدخول غير صحيحة";

  const result = await db
    .select({ user: users, role: roles, tenant: tenants })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(tenants, eq(users.tenantId, tenants.id))
    .where(eq(users.email, email))
    .limit(1);

  if (result.length === 0) {
    await logSecurity({ event: "login_failed_unknown_email", severity: "medium", ipAddress, userAgent, metadata: { email } });
    throw new AppError(401, GENERIC_ERROR, undefined, "AUTH_FAILED");
  }

  const { user, role, tenant } = result[0];

  if (!user.isActive) {
    await logSecurity({ event: "login_failed_inactive_user", severity: "medium", userId: user.id, tenantId: user.tenantId, ipAddress, userAgent });
    throw new AppError(401, GENERIC_ERROR, undefined, "AUTH_FAILED");
  }

  if (user.accountLockedUntil && new Date() < new Date(user.accountLockedUntil)) {
    const minutesLeft = Math.ceil((new Date(user.accountLockedUntil).getTime() - Date.now()) / 60000);
    await logSecurity({ event: "login_attempt_on_locked_account", severity: "high", userId: user.id, tenantId: user.tenantId, ipAddress, userAgent });
    throw new AppError(423, `الحساب مقفل مؤقتاً بسبب محاولات متعددة. حاول مجدداً بعد ${minutesLeft} دقيقة`, undefined, "ACCOUNT_LOCKED");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const newAttempts = (user.failedLoginAttempts ?? 0) + 1;
    const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;
    await db.update(users).set({
      failedLoginAttempts: newAttempts,
      accountLockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
    }).where(eq(users.id, user.id));

    if (shouldLock) {
      await logSecurity({ event: "account_locked_brute_force", severity: "high", userId: user.id, tenantId: user.tenantId, ipAddress, userAgent, metadata: { attempts: newAttempts } });
    } else {
      await logSecurity({ event: "login_failed_wrong_password", severity: "medium", userId: user.id, tenantId: user.tenantId, ipAddress, userAgent, metadata: { attempts: newAttempts } });
    }
    throw new AppError(401, GENERIC_ERROR, undefined, "AUTH_FAILED");
  }

  if (tenant?.status === "suspended") {
    throw new AppError(403, "تم إيقاف هذا المتجر مؤقتاً. يرجى التواصل مع الدعم الفني.", { reason: "suspended" });
  }

  if (tenant?.status === "deactivated" || tenant?.status === "deleted") {
    throw new AppError(403, "هذا الحساب غير نشط. يرجى التواصل مع الدعم الفني.", { reason: "deactivated" });
  }

  await db.update(users).set({
    lastLoginAt: new Date(),
    failedLoginAttempts: 0,
    accountLockedUntil: null,
  }).where(eq(users.id, user.id));

  await logSecurity({ event: "login_success", severity: "low", userId: user.id, tenantId: user.tenantId, ipAddress, userAgent });

  const payload: JwtPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    branchId: user.branchId ?? undefined,
    roleSlug: role?.slug ?? "cashier",
    roleName: role?.name ?? "كاشير",
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      tenantId: user.tenantId,
      branchId: user.branchId,
      role: role?.slug ?? "cashier",
      roleName: role?.name ?? "كاشير",
      tenantName: tenant?.name ?? "",
      ...getTrialInfo(tenant),
    },
  };
}

export async function getCurrentUser(userId: string) {
  const result = await db
    .select({ user: users, role: roles, tenant: tenants })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(tenants, eq(users.tenantId, tenants.id))
    .where(and(eq(users.id, userId), eq(users.isActive, true)))
    .limit(1);

  if (result.length === 0) {
    throw new AppError(404, "المستخدم غير موجود");
  }

  const { user, role, tenant } = result[0];
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    tenantId: user.tenantId,
    branchId: user.branchId,
    role: role?.slug ?? "cashier",
    roleName: role?.name ?? "كاشير",
    tenantName: tenant?.name ?? "",
    lastLoginAt: user.lastLoginAt,
    ...getTrialInfo(tenant),
  };
}
