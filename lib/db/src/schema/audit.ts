import { pgTable, text, timestamp, uuid, index, jsonb } from "drizzle-orm/pg-core";
import { tenants, branches } from "./tenants";
import { users } from "./users";

export const securityLogs = pgTable("security_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  branchId: uuid("branch_id").references(() => branches.id),
  event: text("event").notNull(),
  severity: text("severity").notNull().default("low"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("security_logs_tenant_id_idx").on(t.tenantId),
  index("security_logs_user_id_idx").on(t.userId),
  index("security_logs_event_idx").on(t.event),
  index("security_logs_severity_idx").on(t.severity),
  index("security_logs_created_at_idx").on(t.createdAt),
]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  branchId: uuid("branch_id").references(() => branches.id),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(), // create, update, delete, login, logout, etc.
  entityType: text("entity_type"), // product, user, order, etc.
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("audit_logs_tenant_id_idx").on(t.tenantId),
  index("audit_logs_user_id_idx").on(t.userId),
  index("audit_logs_entity_type_idx").on(t.entityType),
  index("audit_logs_created_at_idx").on(t.createdAt),
]);

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  branchId: uuid("branch_id").references(() => branches.id),
  userId: uuid("user_id").references(() => users.id),
  userName: text("user_name"),
  action: text("action").notNull(),
  page: text("page"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("activity_logs_tenant_id_idx").on(t.tenantId),
  index("activity_logs_user_id_idx").on(t.userId),
  index("activity_logs_created_at_idx").on(t.createdAt),
]);

export type AuditLog = typeof auditLogs.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
