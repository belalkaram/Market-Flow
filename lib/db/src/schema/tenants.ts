import { pgTable, text, integer, boolean, timestamp, uuid, index, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  phone: text("phone"),
  address: text("address"),
  taxNumber: text("tax_number"),
  currency: text("currency").notNull().default("KWD"),
  timezone: text("timezone").notNull().default("Asia/Kuwait"),
  ownerUserId: uuid("owner_user_id"),
  status: text("status").notNull().default("trial"),
  trialStartsAt: timestamp("trial_starts_at").defaultNow(),
  trialEndsAt: timestamp("trial_ends_at"),
  trialDays: integer("trial_days").notNull().default(10),
  subscriptionStatus: text("subscription_status").notNull().default("trial"),
  currentPlanId: uuid("current_plan_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  name: text("name").notNull(),
  city: text("city"),
  address: text("address"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
}, (t) => [
  index("branches_tenant_id_idx").on(t.tenantId),
]);

export const tenantSettings = pgTable("tenant_settings", {
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  settingKey: text("setting_key").notNull(),
  settingValue: text("setting_value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.tenantId, t.settingKey] }),
]);

export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export const insertBranchSchema = createInsertSchema(branches).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export const insertTenantSettingSchema = createInsertSchema(tenantSettings).omit({ updatedAt: true });

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type TenantSetting = typeof tenantSettings.$inferSelect;
export type InsertTenantSetting = z.infer<typeof insertTenantSettingSchema>;
