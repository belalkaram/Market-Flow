import { pgTable, text, timestamp, uuid, index, jsonb } from "drizzle-orm/pg-core";
import { tenants, branches } from "./tenants";
import { users } from "./users";

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  branchId: uuid("branch_id").references(() => branches.id),
  createdById: uuid("created_by_id").references(() => users.id),
  title: text("title").notNull(),
  department: text("department").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  internalNote: text("internal_note"),
  replyMessage: text("reply_message"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("support_tickets_tenant_id_idx").on(t.tenantId),
  index("support_tickets_status_idx").on(t.status),
  index("support_tickets_created_at_idx").on(t.createdAt),
]);

export const orderRequests = pgTable("order_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  branchId: uuid("branch_id").references(() => branches.id),
  createdById: uuid("created_by_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address"),
  customerArea: text("customer_area"),
  notes: text("notes"),
  paymentMethod: text("payment_method").notNull(),
  deliveryMethod: text("delivery_method").notNull(),
  items: jsonb("items").notNull(),
  subtotal: text("subtotal").notNull(),
  discount: text("discount").notNull().default("0"),
  deliveryFee: text("delivery_fee").notNull().default("0"),
  total: text("total").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("order_requests_tenant_id_idx").on(t.tenantId),
  index("order_requests_status_idx").on(t.status),
  index("order_requests_created_at_idx").on(t.createdAt),
]);

export type SupportTicket = typeof supportTickets.$inferSelect;
export type OrderRequest = typeof orderRequests.$inferSelect;
