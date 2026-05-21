import { Request } from "express";
import { db } from "@workspace/db";
import { securityLogs, activityLogs } from "@workspace/db/schema";
import { logger } from "../lib/logger";

export type SecuritySeverity = "low" | "medium" | "high" | "critical";

export interface SecurityLogParams {
  event: string;
  severity?: SecuritySeverity;
  userId?: string;
  tenantId?: string;
  branchId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export async function logSecurity(params: SecurityLogParams): Promise<void> {
  try {
    await db.insert(securityLogs).values({
      event: params.event,
      severity: params.severity ?? "low",
      userId: params.userId ?? null,
      tenantId: params.tenantId ?? null,
      branchId: params.branchId ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      metadata: params.metadata ?? null,
    });
  } catch (err) {
    logger.error({ err }, "Failed to write security log");
  }
}

export function logSecurityFromReq(
  req: Request,
  event: string,
  severity: SecuritySeverity = "low",
  metadata?: Record<string, unknown>,
): Promise<void> {
  return logSecurity({
    event,
    severity,
    userId: req.user?.userId,
    tenantId: req.user?.tenantId,
    branchId: req.user?.branchId,
    ipAddress: req.ip ?? req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
    metadata,
  });
}

export interface ActivityLogParams {
  tenantId?: string;
  branchId?: string;
  userId?: string;
  userName?: string;
  action: string;
  page?: string;
  details?: string;
  ipAddress?: string;
}

export async function logActivity(params: ActivityLogParams): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      tenantId: params.tenantId ?? null,
      branchId: params.branchId ?? null,
      userId: params.userId ?? null,
      userName: params.userName ?? null,
      action: params.action,
      page: params.page ?? null,
      details: params.details ?? null,
      ipAddress: params.ipAddress ?? null,
    });
  } catch (err) {
    logger.error({ err }, "Failed to write activity log");
  }
}

export function logActivityFromReq(
  req: Request,
  action: string,
  page: string,
  details?: string,
): Promise<void> {
  return logActivity({
    tenantId: req.user?.tenantId,
    branchId: req.user?.branchId,
    userId: req.user?.userId,
    userName: (req as any).userName,
    action,
    page,
    details,
    ipAddress: req.ip ?? req.socket.remoteAddress,
  });
}
