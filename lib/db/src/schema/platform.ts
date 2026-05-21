import { pgTable, text, integer, boolean, timestamp, uuid, numeric, jsonb, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { tenants } from "./tenants";

export const platformAdmins = pgTable("platform_admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  priceMonthly: numeric("price_monthly", { precision: 12, scale: 2 }).notNull().default("0"),
  priceYearly: numeric("price_yearly", { precision: 12, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("KWD"),
  maxUsers: integer("max_users").notNull().default(5),
  maxBranches: integer("max_branches").notNull().default(1),
  maxProducts: integer("max_products").notNull().default(100),
  features: jsonb("features"),
  isActive: boolean("is_active").notNull().default(true),
  isRecommended: boolean("is_recommended").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const storeSubscriptions = pgTable("store_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull().references(() => tenants.id),
  planId: uuid("plan_id").references(() => subscriptionPlans.id),
  status: text("status").notNull().default("trial"),
  startsAt: timestamp("starts_at").notNull().defaultNow(),
  endsAt: timestamp("ends_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("store_subscriptions_store_id_idx").on(t.storeId),
]);

export const storePayments = pgTable("store_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull().references(() => tenants.id),
  subscriptionId: uuid("subscription_id").references(() => storeSubscriptions.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("KWD"),
  paymentMethod: text("payment_method").notNull().default("manual"),
  status: text("status").notNull().default("paid"),
  paidAt: timestamp("paid_at").notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("store_payments_store_id_idx").on(t.storeId),
]);

export const platformAuditLogs = pgTable("platform_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  superAdminId: uuid("super_admin_id").references(() => platformAdmins.id),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("platform_audit_logs_admin_id_idx").on(t.superAdminId),
  index("platform_audit_logs_created_at_idx").on(t.createdAt),
]);

export const insertPlatformAdminSchema = createInsertSchema(platformAdmins).omit({ id: true, createdAt: true, updatedAt: true, passwordHash: true }).extend({
  password: z.string().min(8),
});
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ id: true, createdAt: true, updatedAt: true });

export type PlatformAdmin = typeof platformAdmins.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type StoreSubscription = typeof storeSubscriptions.$inferSelect;
export type StorePayment = typeof storePayments.$inferSelect;
export type PlatformAuditLog = typeof platformAuditLogs.$inferSelect;
